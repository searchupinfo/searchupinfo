import { TextServiceClient } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";
import { GetArticleVersionsStore, InsertArticleVersionsStore } from '$houdini'

async function runModel(promptString: string, temperature: number) {
    const MODEL_NAME = "models/text-bison-001";
    const API_KEY = import.meta.env.VITE_API_KEY;

    const client = new TextServiceClient({
        authClient: new GoogleAuth().fromAPIKey(API_KEY),
    });

    console.log(promptString)

    return await client.generateText({
        // required, which model to use to generate the result
        model: MODEL_NAME,
        // optional, 0.0 always uses the highest-probability result
        temperature: temperature,
        // optional, how many candidate results to generate
        candidateCount: 1,
        // optional, number of most probable tokens to consider for generation
        topK: 40,
        // optional, for nucleus sampling decoding strategy
        topP: 0.95,
        // optional, maximum number of output tokens to generate
        maxOutputTokens: 8000,
        // optional, sequences at which to stop model generation
        //stopSequences: stopSequences,
        // optional, safety settings
        // Make sure to set all to high (unfortunatly can't turn off safety settings) so that it can generate articles about controversial topics
        safetySettings: [{ "category": "HARM_CATEGORY_DEROGATORY", "threshold": "BLOCK_ONLY_HIGH" }, { "category": "HARM_CATEGORY_TOXICITY", "threshold": "BLOCK_ONLY_HIGH" }, { "category": "HARM_CATEGORY_VIOLENCE", "threshold": "BLOCK_ONLY_HIGH" }, { "category": "HARM_CATEGORY_SEXUAL", "threshold": "BLOCK_ONLY_HIGH" }, { "category": "HARM_CATEGORY_MEDICAL", "threshold": "BLOCK_ONLY_HIGH" }, { "category": "HARM_CATEGORY_DANGEROUS", "threshold": "BLOCK_ONLY_HIGH" }],
        prompt: {
            text: promptString,
        },
    }).then(result => {
        if (result && result[0] && result[0].candidates) {
            if (result[0].candidates[0])
                return result[0].candidates[0].output!;
            else
                return null;
        }
        console.log(result)
        throw new Error("Invalid result object");
    });
}

export async function GET(event) {
    let articleName = event.params.slug

    if (articleName.length < 31) {
        // check if article exists and return it if it does
        const getArticle = new GetArticleVersionsStore()
        let response = await getArticle.fetch({ event, variables: { name: articleName } })

        let articleText = response.data?.article_versions[0]?.text ?? null

        if (articleText) {
            return new Response(articleText)
        }

        // You need to surround the article name in quotes so that it doesn't misinterpret a prompt like "Write the introduction of a wikipedia article about twice" and it returns a generic reponse twice.
        let introductionText = await runModel(`Write the introduction of a wikipedia article about "${articleName}"`, 0.7)

        articleText = `# ${articleName}\n${introductionText}\n`

        // It is super important to show the sturcture the output is and to specify it not to format it as markdown so that it does not wrap it in ```js ```. Setting temp at 0.0 also reduces the likelihood of this happening. 
        let responseSectionsString = await runModel(`Return a JSON array as "[..., ...]" with at most 20 elements for the section names of a wikipedia article about "${articleName}". Do not format it as markdown. Do not include an introduction. DO NOT start with \`\`\` and the array must end in with a ] and no trailing comma`, 0.0)

        console.log(responseSectionsString)

        if (responseSectionsString) {
            let responseSections: Array<string> = JSON.parse(responseSectionsString)

            // remove references, see also, external links, elements regardless of case
            responseSections = responseSections.filter(section => !section.match(/references|see also|external links/i))

            // write each section
            for (let sectionName of responseSections) {
                let sectionText = await runModel(`Write the ${sectionName} section of a wikipedia article about "${articleName}". Do not include the title of the section or links inside of the text`, 0.7)

                if (sectionText) {
                    const regexPattern = new RegExp(`^.*\\b${sectionName}\\b.*\\n?`);
                    sectionText = sectionText.replace(regexPattern, '');
                    articleText += `## ${sectionName}\n${sectionText}\n\n`
                }
            }
        }
        else {
            articleText = "Sections were unable to be generated."
        }

        // Add the article to the DB
        const insertArticle = new InsertArticleVersionsStore()
        await insertArticle.mutate({ name: articleName, text: articleText }, { event: event })

        return new Response(articleText)
    }
    else {
        return new Response('Title must be less than 31 characters.')
    }
}