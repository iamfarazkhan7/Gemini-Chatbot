import "dotenv/config";
import { PineconeStore } from "@langchain/pinecone";
import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";
import { pineconeIndex } from "./utils/pineconeClient.js";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: "models/embedding-001",
});

const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
});

const chatModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-1.5-flash",
});

const MATCH_THRESHOLD = 0.8;

export async function askQuestion(userQ) {
  const results = await vectorStore.similaritySearchWithScore(userQ, 1);
  const [bestMatch, score] = results[0] || [];

  if (bestMatch && score >= MATCH_THRESHOLD) {
    return bestMatch.pageContent;
  }

  const res = await chatModel.invoke(userQ);
  const answerText = res.content;

  await vectorStore.addDocuments([
    {
      pageContent: answerText,
      metadata: {
        source: "gemini",
        question: userQ,
        createdAt: new Date().toISOString(),
      },
    },
  ]);

  return answerText;
}
