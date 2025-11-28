import { pipeline } from "@xenova/transformers";

let mrToEnTranslator = null;

// We only need Marathi to English for the owner searching English names
export async function translateMRtoEN(text) {
  try {
    if (!mrToEnTranslator) {
      console.log("Loading translation model...");
      mrToEnTranslator = await pipeline(
        "translation",
        "Helsinki-NLP/opus-mt-mr-en"
      );
    }
    const output = await mrToEnTranslator(text);
    // The model might return "Rahul" for "राहुल"
    return output[0].translation_text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to original text
  }
}
