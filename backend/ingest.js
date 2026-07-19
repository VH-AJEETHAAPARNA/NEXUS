const fs = require("fs");
const pdfParse = require("pdf-parse");   // ✅ import directly
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { pipeline } = require("@xenova/transformers");

// Configuration
const BATCH_SIZE = 20;
const DELAY_MS = 200;
const CHUNK_SIZE = 500;

const mongo = new MongoClient(process.env.MONGO_URI);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function ingestDocument(filePath) {
  try {
    await mongo.connect();
    const db = mongo.db("nexus");

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);   // ✅ fixed
    const text = pdfData.text;

    console.log(`Extracted ${text.length} characters of text.`);

    const chunks = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunks.push(text.substring(i, i + CHUNK_SIZE));
    }
    console.log(`Split into ${chunks.length} chunks.`);

    const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);
    console.log(`Processing in ${totalBatches} batches of up to ${BATCH_SIZE} chunks each.`);

    console.log("Loading embedding model (Xenova/all-MiniLM-L6-v2)...");
    const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Model loaded successfully.\n");

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const currentBatch = batchIndex + 1;
      console.log(`Processing batch ${currentBatch}/${totalBatches}`);

      const startIdx = batchIndex * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, chunks.length);

      for (let i = startIdx; i < endIdx; i++) {
        const chunk = chunks[i];
        const chunkInBatch = i - startIdx + 1;
        const chunksInBatch = endIdx - startIdx;
        console.log(`Processing chunk ${chunkInBatch}/${chunksInBatch} in batch ${currentBatch}`);

        const embedding = await embedder(chunk, { pooling: "mean", normalize: true });

        await db.collection("specs").insertOne({
          doc: "IS 456:2000",
          text: chunk,
          embedding: embedding.data,
        });
      }

      console.log(`✅ Batch ${currentBatch}/${totalBatches} complete.\n`);

      if (currentBatch < totalBatches) {
        console.log(`Waiting ${DELAY_MS}ms before next batch...\n`);
        await delay(DELAY_MS);
      }
    }

    console.log("✅ Ingestion complete with local embeddings!");
  } catch (err) {
    console.error(`❌ Ingestion failed:`, err.message);
    process.exit(1);
  } finally {
    await mongo.close();
  }
}

ingestDocument("../data/standards/IS-456-2000.pdf").catch((err) => {
  console.error("❌ Ingestion failed:", err);
  process.exit(1);
});
