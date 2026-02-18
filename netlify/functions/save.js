const express = require('express');
const serverless = require('serverless-http');
const { neon } = require('@neondatabase/serverless'); 
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// This uses the variable from your screenshot!
const sql = neon(process.env.NET_DATABASE_URL || process.env.NETLIFY_DATABASE_URL);

app.post('/.netlify/functions/save', async (req, res) => {
    const { filename, text } = req.body;
    
    try {
        // NOTE: Replace your .exe logic with a JS function here
        const encryptedText = Buffer.from(text).toString('base64'); // Simple example encryption

        const result = await sql`
            INSERT INTO secrets (original_filename, encrypted_content) 
            VALUES (${filename}, ${encryptedText}) 
            RETURNING *`;

        res.json({ message: 'Saved to Neon!', data: result[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports.handler = serverless(app);