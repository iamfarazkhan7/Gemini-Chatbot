import "dotenv/config";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { pineconeIndex } from "./pineconeClient.js";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: "models/embedding-001",
});

const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex: pineconeIndex,
});

export const retriever = vectorStore.asRetriever({ k: 3 });