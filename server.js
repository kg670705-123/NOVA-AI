
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// Website files
app.use(express.static(path.join(__dirname, "static")));

// Local AI settings
const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";
const MODEL = "qwen3:4b";

// Nova AI Chat API
app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body.message;

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        // Connect to Ollama Local AI
        const response = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are Nova AI, a helpful assistant. Answer accurately in Hindi, English or Hinglish according to the user's language. Explain maths step by step when asked."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error("Ollama Error:", errorDetails);

            return res.status(502).json({
                error: "Local AI is not responding. Please check Ollama."
            });
        }

        const data = await response.json();

        res.json({
            reply: data.message?.content || "No answer received."
        });

    } catch (error) {
        console.error("Nova AI Error:", error.message);

        res.status(500).json({
            error: "Nova AI could not generate an answer."
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Nova AI Started Successfully!");
    console.log("Local AI: Ollama Qwen3 4B");
    console.log("Website: http://localhost:" + PORT);
});
