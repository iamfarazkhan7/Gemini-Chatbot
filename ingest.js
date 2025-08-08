import "dotenv/config";
import { promises as fs } from "fs";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { pineconeIndex } from "./utils/pineconeClient.js";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: "models/embedding-001",
});

async function ingestDocument(filePath) {
  const textContent = await fs.readFile(filePath, "utf-8");

  const paragraphs = textContent
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  console.log(`Found ${paragraphs.length} paragraphs in ${filePath}`);

  const documents = paragraphs.map((paragraph, index) => ({
    pageContent: paragraph,
    metadata: {
      source: filePath,
      paragraph: index + 1,
      timestamp: new Date().toISOString(),
    },
  }));

  await PineconeStore.fromDocuments(documents, embeddings, {
    pineconeIndex: pineconeIndex,
  });

  console.log(`Stored ${documents.length} paragraphs from ${filePath}`);
}

async function ingestMultipleFiles(folderPath) {
  const files = await fs.readdir(folderPath);
  const textFiles = files.filter((file) => file.endsWith(".txt"));

  console.log(`Found ${textFiles.length} text files to process`);

  for (const file of textFiles) {
    const filePath = `${folderPath}/${file}`;
    await ingestDocument(filePath);
  }

  console.log(`All files processed successfully!`);
}

await ingestMultipleFiles("./data");
