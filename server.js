const express = require('express');
const { execFile } = require('child_process');
const { Client } = require('pg');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const client = new Client(dbConfig);
client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

app.use(express.static('public')); // Serve frontend files
app.use(express.json());
app.use(cors());

// THE SECURE API ROUTE
app.post('/save', (req, res) => {
    const { filename, text } = req.body;

    if (!text || !filename) return res.status(400).json({ error: 'Missing data' });

    // 1. Get the secret key from environment variables (Best Practice!)
    // If not set, use a fallback (though in prod you'd want to fail hard)
    const secretKey = process.env.ENCRYPTION_KEY || "default_placement_key";

    // CHANGE: Use execFile for better security (avoids shell injection)
    // Program name
    const program = 'encrypt.exe';

    // Arguments as an array: [text_to_encrypt, secret_key]
    const args = [text, secretKey];

    // 2. Run safely using execFile
    execFile(program, args, (error, stdout, stderr) => {
        if (error) {
            console.error("Execution Error:", stderr);
            return res.status(500).json({ error: 'Encryption failed' });
        }

        const encryptedText = stdout.trim();

        // 3. Save to Database
        const query = 'INSERT INTO secrets (original_filename, encrypted_content) VALUES ($1, $2) RETURNING *';
        const values = [filename, encryptedText];

        client.query(query, values)
            .then(dbRes => {
                res.json({
                    message: 'Saved successfully!',
                    data: dbRes.rows[0]
                });
            })
            .catch(e => {
                console.error(e.stack);
                res.status(500).json({ error: 'Database error' });
            });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
