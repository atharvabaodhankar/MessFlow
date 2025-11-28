import { pipeline, env } from "@xenova/transformers";

// Skip local model checks to avoid 404s/index.html responses in Vite
env.allowLocalModels = false;
env.useBrowserCache = true;

let mrToEnTranslator = null;
let enToMrTranslator = null;

// Marathi to English (for Search)
export async function translateMRtoEN(text) {
  try {
    if (!mrToEnTranslator) {
      console.log("Loading MR->EN model...");
      mrToEnTranslator = await pipeline(
        "translation",
        "Helsinki-NLP/opus-mt-mr-en"
      );
    }
    const output = await mrToEnTranslator(text);
    return output[0].translation_text;
  } catch (error) {
    console.error("Translation error (MR->EN):", error);
    return text;
  }
}

// English to Marathi (for Display)
export async function translateENtoMR(text) {
  try {
    if (!enToMrTranslator) {
      console.log("Loading EN->MR model...");
      enToMrTranslator = await pipeline(
        "translation",
        "Helsinki-NLP/opus-mt-en-mr"
      );
    }
    const output = await enToMrTranslator(text);
    return output[0].translation_text;
  } catch (error) {
    console.error("Translation error (EN->MR):", error);
    return text;
  }
}
