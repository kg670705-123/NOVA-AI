
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "static")));

// OpenAI configuration
const OPENAI_URL = "https://api.openai.com/v1/responses";
const MODEL = process.env.OPENAI_MODEL || "gpt-6-luna";

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Nova AI Backend is running!"
    });
});

// Nova AI Chat API
app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body.message;

        // Validate message
        if (
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        // Check API key
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.error("OPENAI_API_KEY is missing!");

            return res.status(500).json({
                error: "API key is missing. Check Render Environment Variables."
            });
        }

        // Send request to OpenAI
        const response = await fetch(OPENAI_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },

            body: JSON.stringify({
                model: MODEL,

                instructions:
                    "You are Nova AI, a helpful study and productivity assistant. Answer user questions clearly. You can communicate in Hindi, English and Hinglish.",

                input: message,

                max_output_tokens: 1000
            })
        });

        // Read response
        const data = await response.json();

        // Handle OpenAI errors
        if (!response.ok) {
            console.error("OpenAI Error:", data);

            return res.status(response.status).json({
                error:
                    data.error?.message ||
                    "OpenAI request failed."
            });
        }

        // Extract AI answer
        const answer = (data.output || [])
            .flatMap(item => item.content || [])
            .filter(item => item.type === "output_text")
            .map(item => item.text)
            .join("\n");

        if (!answer) {
            console.error("Empty AI response:", data);

            return res.status(502).json({
                error: "Nova AI received an empty response."
            });
        }

        console.log("Nova AI answered successfully.");

        return res.json({
            success: true,
            reply: answer,
            answer: answer
        });

    } catch (error) {
        console.error("Nova AI Server Error:", error);

        return res.status(500).json({
            error: "Something went wrong. Please try again."
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("================================");
    console.log("Nova AI Started Successfully!");
    console.log("AI Model:", MODEL);
    console.log("Port:", PORT);
    console.log("================================");
});
