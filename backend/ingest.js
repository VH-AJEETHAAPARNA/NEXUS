import fs from "fs";
import { MongoClient } from "mongodb";
import OpenAI from "openai";
import "dotenv/config";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");   // CommonJS inside ESM

const mongo = new MongoClient(
  "mongodb+srv://nexus_user:nexususer1470@nexus.dzb7gmg.mongodb.net/?appName=nexus"
);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function ingestDocument(filePath) {
  await mongo.connect();
  const db = mongo.db("nexus");

  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);   // ✅ now works
  const text = pdfData.text;

  const chunks = text.match(/.{1,500}/g);

  for (const chunk of chunks) {
    const embedding = await client.embeddings.create({
      model: "text-embedding-ada-002",
      input: chunk
    });

    await db.collection("specs").insertOne({
      doc: "IS 456:2000",
      text: chunk,
      embedding: embedding.data[0].embedding
    });
  }

  console.log("✅ Ingestion complete!");
  await mongo.close();
}

ingestDocument("../data/standards/IS-456-2000.pdf");
