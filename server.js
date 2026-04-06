const express = require('express');
const { Client } = require('pg');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto'); // Built-in Node encryption
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// DATABASE SETUP
const client = new Client({
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

app.use(express.static('public')); 
app.use(express.json());
app.use(cors());

// HELPER FUNCTIONS (REPLACES CRYPTO.EXE)
const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default_key', 'salt', 32);

const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // Store IV with the text
};

const decrypt = (text) => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// THE SECURE API ROUTE
app.post('/save', (req, res) => {
    const { filename, text } = req.body;
    if (!text || !filename) return res.status(400).json({ error: 'Missing data' });

    try {
        const encryptedText = encrypt(text);
        const query = 'INSERT INTO secrets (original_filename, encrypted_content) VALUES ($1, $2) RETURNING *';
        const values = [filename, encryptedText];

        client.query(query, values)
            .then(dbRes => res.json({ message: 'Saved successfully!', data: dbRes.rows[0] }))
            .catch(e => res.status(500).json({ error: 'Database error' }));
    } catch (err) {
        res.status(500).json({ error: 'Encryption failed' });
    }
});

// THE VAULT RETRIEVAL ROUTES
app.get('/secrets', (req, res) => {
    const query = 'SELECT id, original_filename FROM secrets ORDER BY id DESC';
    client.query(query)
        .then(dbRes => res.json({ data: dbRes.rows }))
        .catch(e => res.status(500).json({ error: 'Database error' }));
});

app.post('/decrypt', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing secret ID' });

    client.query('SELECT encrypted_content FROM secrets WHERE id = $1', [id])
        .then(dbRes => {
            if (dbRes.rows.length === 0) return res.status(404).json({ error: 'Secret not found' });
            const decryptedContent = decrypt(dbRes.rows[0].encrypted_content);
            res.json({ decrypted_content: decryptedContent });
        })
        .catch(e => res.status(500).json({ error: 'Decryption failed' }));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
