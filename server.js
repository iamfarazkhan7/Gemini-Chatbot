import "dotenv/config";
import express from "express";
import cors from "cors";
import { askQuestion } from "./askQuestion.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const answer = await askQuestion(message);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3001, () =>
  console.log("🚀 Server running on http://localhost:3001")
);
