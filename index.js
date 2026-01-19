const express = require('express');
const axios = require('axios');
const { generateWithGroq } = require('./groqService');
const { uploadToGoogle } = require('./googleService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json({ limit: '10mb' })); // Increased limit for large diffs

// Endpoint 1: Fetch PR Files from GitHub
app.get('/api/pr', async (req, res) => {
    const { owner, repo, pull_number } = req.query;
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/files`,
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Endpoint 2: Generate and Save Documentation
app.post('/api/generate-docs', async (req, res) => {
    const { owner, repo, prNumber, diffData } = req.body;

    try {
        const prompt = `
            You are a technical lead. Analyze the Git diff for PR #${prNumber} in "${owner}/${repo}".
            
            Task: Create a concise, high-impact technical summary (.md).
            Rules: Use bullet points. Be extremely brief and to the point. No fluff.
            
            Structure:
            1. **Goal**: One sentence summary of the PR.
            2. **Key Changes**: Short bullet points of only the important logical/technical changes.
            3. **Files Modified**: List files with a 1-line description of the change in each.
            
            Diff Data:
            ${JSON.stringify(diffData)}
        `;

        const result = await generateWithGroq(prompt);
        const mdContent = result;

        // This returns the actual Google Doc Link
        const docUrl = await uploadToGoogle(repo, prNumber, mdContent);
        console.log("docUrl", docUrl);

        res.json({
            message: 'Success',
            path: docUrl, // <--- FIX: Send the real Google URL here
            content: mdContent
        });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI Generation failed: " + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`Using model: openai/gpt-oss-120b via Groq`);
});