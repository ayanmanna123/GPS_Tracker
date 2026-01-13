import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

let store = null;

// ES module-friendly __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initSupportBot = async () => {
  try {
    // Resolve absolute path to knowledge.json
    const knowledgePath = path.join(__dirname, "../knowledge.json");

    // Check if file exists
    if (!fs.existsSync(knowledgePath)) {
      throw new Error(`❌ knowledge.json file not found at ${knowledgePath}`);
    }

    const data = JSON.parse(fs.readFileSync(knowledgePath, "utf-8"));

    const embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: "Xenova/all-MiniLM-L6-v2",
    });

    store = await MemoryVectorStore.fromTexts(
      data.map((d) => d.question),
      data.map((d) => ({ answer: d.answer })),
      embeddings,
    );

    console.log("✅ SupportBot knowledge base initialized!");
  } catch (error) {
    console.error("❌ Failed to initialize SupportBot:", error);
    throw error; // Let the app fail if this is critical
  }
};

export const askSupportBot = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // Lazy init if store is not ready
    if (!store) {
      console.log("⚙️ Reinitializing SupportBot...");
      await initSupportBot();
    }

    const result = await store.similaritySearch(question, 1);
    const bestMatch =
      result[0]?.metadata?.answer || "Sorry, I don't know the answer.";

    res.json({ answer: bestMatch });
  } catch (err) {
    console.error("❌ SupportBot error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
