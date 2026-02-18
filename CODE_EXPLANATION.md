# Secure File Vault - Complete Code Explanation 📚

This document contains the **full source code** for every file in the project, followed by a detailed line-by-line explanation of how it works. This is perfect for understanding the flow and preparing for interview questions.

---

## 🔄 Project Logic Flow
1.  **Frontend (`index.html`)**: User enters text. Browser sends it via HTTP POST to the server.
2.  **Backend (`server.js`)**: Node.js receives the text. It securely calls the C++ program using `child_process.execFile`.
3.  **Security (`encrypt.cpp`)**: The C++ program uses an **XOR Cipher** with a secret key to encrypt the text and converts it to **Hexadecimal** format for safety.
4.  **Database**: The encrypted hex string is stored in PostgreSQL.
5.  **Response**: The server sends the encrypted string back to the user.

---

## 1. The Security Engine: `encrypt.cpp`
This C++ program handles the logic. It takes `text` and `key` as inputs and outputs the encrypted hex string.

### 📝 Full Code
```cpp
#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>

// Function: XOR Encryption
std::string encryptXOR(std::string text, std::string key) {
    std::string result = "";
    for (size_t i = 0; i < text.length(); i++) {
        char textChar = text[i];
        char keyChar = key[i % key.length()];
        char encryptedChar = textChar ^ keyChar; // The core Logic
        result += encryptedChar;
    }
    return result;
}

// Function: Convert to Hexadecimal for safe storage
std::string toHex(std::string text) {
    std::stringstream ss;
    for (unsigned char c : text) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)c;
    }
    return ss.str();
}

int main(int argc, char* argv[]) {
    if (argc < 3) {
        std::cerr << "Usage: encrypt.exe <text> <key>" << std::endl;
        return 1;
    }
    std::string input_text = argv[1];
    std::string secret_key = argv[2];

    std::string raw_encrypted = encryptXOR(input_text, secret_key);
    std::string safe_output = toHex(raw_encrypted);

    std::cout << safe_output;
    return 0;
}
```

### 🔍 Explanation
-   `encryptXOR`: Loops through the text. The `^` operator (XOR) mixes each letter with a letter from the key. If you XOR it again with the same key, it decrypts!
-   `key[i % key.length()]`: If the key is shorter than the text, this "wraps around" to reuse the key from the beginning.
-   `toHex`: Encryption can create unreadable symbols that break databases. This function converts them into safe numbers and letters (e.g., `A` -> `41`).
-   `argc < 3`: Ensures the program was called with both "Text" and "Key".

---

## 2. The Brain: `server.js`
The Node.js server acts as the middleman between the User, C++, and Database.

### 📝 Full Code
```javascript
const express = require('express');
const { execFile } = require('child_process');
const { Client } = require('pg');
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
client.connect().then(() => console.log('Connected to PostgreSQL'));

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.post('/save', (req, res) => {
    const { filename, text } = req.body;
    if (!text || !filename) return res.status(400).json({ error: 'Missing data' });

    const secretKey = process.env.ENCRYPTION_KEY || "default_placement_key";
    const program = 'encrypt.exe';
    
    // Pass arguments as an array for security
    const args = [text, secretKey]; 

    execFile(program, args, (error, stdout, stderr) => {
        if (error) {
            console.error("Execution Error:", stderr);
            return res.status(500).json({ error: 'Encryption failed' });
        }

        const encryptedText = stdout.trim();
        const query = 'INSERT INTO secrets (original_filename, encrypted_content) VALUES ($1, $2) RETURNING *';
        const values = [filename, encryptedText];

        client.query(query, values)
            .then(dbRes => res.json({ message: 'Saved successfully!', data: dbRes.rows[0] }))
            .catch(e => res.status(500).json({ error: 'Database error' }));
    });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
```

### 🔍 Explanation
-   `execFile`: A securely explicit way to run external programs. It avoids using the system shell (`cmd.exe`), preventing hackers from running their own commands.
-   `args = [text, secretKey]`: Arguments are passed as an array, ensuring spaces or special characters in the text don't confuse the system.
-   `process.env.ENCRYPTION_KEY`: The secret password used for encryption is stored in the `.env` file, keeping it out of the source code.
-   `client.query(query, values)`: Uses "Formatted Values" (`$1`, `$2`) to insert data into PostgreSQL. This prevents **SQL Injection** attacks.

---

## 3. The Face: `public/index.html`
The simple user interface.

### 📝 Full Code
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Secure File Vault</title>
    <style>
        body { font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; }
        input, textarea { width: 100%; margin-bottom: 10px; padding: 8px; }
        button { padding: 10px 20px; background-color: #28a745; color: white; border: none; cursor: pointer; }
        #output { margin-top: 20px; color: #333; }
    </style>
</head>
<body>
    <h1>Secure File Vault 🔒</h1>
    <label>Filename:</label>
    <input type="text" id="filename" placeholder="e.g., secret.txt">
    <label>Secret Content:</label>
    <textarea id="content" rows="4"></textarea>
    <button onclick="saveSecret()">Secure Save</button>
    <div id="output"></div>

    <script>
        async function saveSecret() {
            const filename = document.getElementById('filename').value;
            const text = document.getElementById('content').value;
            
            const response = await fetch('/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, text })
            });

            const result = await response.json();
            if (response.ok) {
                document.getElementById('output').innerHTML = 
                    `<p style="color: green;">✅ Success! Encrypted: <strong>${result.data.encrypted_content}</strong></p>`;
            } else {
                document.getElementById('output').innerHTML = `<p style="color: red;">❌ Error: ${result.error}</p>`;
            }
        }
    </script>
</body>
</html>
```

### 🔍 Explanation
-   `fetch('/save', ...)`: Sends the data (filename and text) to our backend API via a POST request.
-   `JSON.stringify(...)`: Converts the JavaScript object data into a JSON string standard format for sending over the web.
-   `async/await`: Allows the browser to wait for the server's response without freezing the page.
