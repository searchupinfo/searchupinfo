import { TextServiceClient } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";

export async function load({ params }) {
  const MODEL_NAME = "models/text-bison-001";
  const API_KEY = import.meta.env.VITE_API_KEY;

  const client = new TextServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY),
  });

  // article name should remove _ and - and replace with spaces
  let articleName = params.slug.replace(/_/g, " ").replace(/-/g, " ");

  console.log(articleName)

  const promptString = `Write a wikipedia article for ${articleName}}. Make sure to use proper markdown headings with #`;
  // const stopSequences = [];

  let response = await client.generateText({
    // required, which model to use to generate the result
    model: MODEL_NAME,
    // optional, 0.0 always uses the highest-probability result
    temperature: 0.7,
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
    safetySettings: [{ "category": "HARM_CATEGORY_DEROGATORY", "threshold": 1 }, { "category": "HARM_CATEGORY_TOXICITY", "threshold": 1 }, { "category": "HARM_CATEGORY_VIOLENCE", "threshold": 2 }, { "category": "HARM_CATEGORY_SEXUAL", "threshold": 2 }, { "category": "HARM_CATEGORY_MEDICAL", "threshold": 2 }, { "category": "HARM_CATEGORY_DANGEROUS", "threshold": 2 }],
    prompt: {
      text: promptString,
    },
  }).then(result => {
    if (result && result[0] && result[0].candidates && result[0].candidates[0]) {
      return result[0].candidates[0].output;
    }
    throw new Error("Invalid result object");
  });

  return {
    props: {
      response,
    },
  };
}