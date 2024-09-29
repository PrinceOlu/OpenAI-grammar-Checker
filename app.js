import "dotenv/config";
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Set the view engine to EJS
app.set("view engine", "ejs");

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Render index.ejs
app.get("/", (req, res) => {
    res.render("index", { originalText: '', correctedText: '' }); 
});

// MAIN correction route
app.post("/correct", async (req, res) => {
    const text = req.body.text ? req.body.text.trim() : ''; 

    // Validate input
    if (!text) {
        return res.status(400).render("index", {
            error: "Please enter some text",
            originalText: text, 
            correctedText: '',
        });
    }
    
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_KEYS}`, 
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-2024-07-18", 
                messages: [{ role: "user", content: text }],
                max_tokens: 100,
                n: 1,
                stop: null,
                temperature: 0.5,
            }),
        });

        // Handle API response
        if (!response.ok) {
            return res.status(400).render("index", {
                error: "Error while fetching data from OpenAI API",
                originalText: text,
                correctedText: '',
            });
        }

        const data = await response.json();
        const correctedText = data.choices[0].message.content;

        // Render index with corrected text
        res.render("index", {
            originalText: text, 
            correctedText: correctedText, 
        });
        
    } catch (error) {
        // Handle errors during fetch or processing
        res.render("index", { 
            error: error.message, 
            originalText: text, 
            correctedText: '' 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
