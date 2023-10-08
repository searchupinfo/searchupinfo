import { TextServiceClient } from "@google-ai/generativelanguage";
import { json } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";

async function runModel(promptString: string, temperature: number) {
  const MODEL_NAME = "models/text-bison-001";
  const API_KEY = import.meta.env.VITE_API_KEY;

  const client = new TextServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY),
  });

  console.log(promptString)

  // const stopSequences = [];

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
    safetySettings: [{"category":"HARM_CATEGORY_DEROGATORY","threshold": "BLOCK_ONLY_HIGH"},{"category":"HARM_CATEGORY_TOXICITY","threshold":"BLOCK_ONLY_HIGH"},{"category":"HARM_CATEGORY_VIOLENCE","threshold":"BLOCK_ONLY_HIGH"},{"category":"HARM_CATEGORY_SEXUAL","threshold":"BLOCK_ONLY_HIGH"},{"category":"HARM_CATEGORY_MEDICAL","threshold":"BLOCK_ONLY_HIGH"},{"category":"HARM_CATEGORY_DANGEROUS","threshold":"BLOCK_ONLY_HIGH"}],
    prompt: {
      text: promptString,
    },
  }).then(result => {
    if (result && result[0] && result[0].candidates ) {
      if (result[0].candidates[0])
        return result[0].candidates[0].output!;
      else
        return null;
    }
    console.log(result)
    throw new Error("Invalid result object");
  });
}

export async function load({ params }) {
  let articleName = params.slug

  let articleText: string = ""

  let introductionText = await runModel(`Write the introduction of a wikipedia article about ${articleName}`, 0.7)

  articleText += `# ${articleName}\n${introductionText}\n`
  
  let responseSectionsString = await runModel(`Return a JSON array as "[..., ...]" for the section names of a wikipedia article about ${articleName}. Do not format it as markdown.`, 0.0)

  console.log(responseSectionsString)

  if (responseSectionsString) {
    let responseSections: Array<string> = JSON.parse(responseSectionsString)

    // remove references, see also, external links, elements regardless of case
    responseSections = responseSections.filter(section => !section.match(/references|see also|external links/i))


    // write each section
    for (let sectionName of responseSections) {
      let sectionText = await runModel(`Write the ${sectionName} section of a wikipedia article about ${articleName}. Do not include the title of the section or links inside of the text`, 0.7)

      if (sectionText) {
        const regexPattern = new RegExp(`^.*\\b${sectionName}\\b.*\\n?`);
        sectionText = sectionText.replace(regexPattern, '');
        articleText += `## ${sectionName}\n${sectionText}\n\n`
      }
    }

    //runModel(`Write a wikipedia article for ${params.slug}. Write a page title first as a level-1 heading (#). For example: "# Page Title". Then write an introduction/summarization after that. The intro SHOULD NOT have a heading for its section (there should be no ## Introduction in the output). it should immedeately folow the page title. Make sure to use proper markdown headings with ## for the remaining sections. Do not write a conclusion or references section.`)
  }
  else {
    articleText = "Sections were unable to be generated."
  }

  return {
    props: {
      response: articleText,
    },
  };
}