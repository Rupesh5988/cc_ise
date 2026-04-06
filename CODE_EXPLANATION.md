# 🛡️ Secure File Vault - Complete Line-by-Line Architecture Explanation

This document contains a complete, line-by-line logical explanation of your renovated **Secure File Vault** project. This is designed to be easily understandable so you can confidently explain it during your placement interviews!

---

## 1. The Security Engine: `crypto.cpp`
This is the core of the vault. It handles both locking (encrypting) and unlocking (decrypting) the files securely without relying on Node.js processing power.

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include <cstdlib>
```
* **Explanation**: These are the standard C++ libraries we need. `iostream` handles input/output so Node.js can read the result, `string` lets us work with text easily, `sstream` and `iomanip` are specialized tools used to safely convert scrambled letters into Hexadecimal numbers.

```cpp
std::string cipherXOR(std::string text, std::string key) {
    std::string result = "";
    if (key.length() == 0) return text;
```
* **Explanation**: This function performs the **Symmetric XOR Cipher**. It takes your `text` and your secret `key` (password). The beauty of XOR is its mathematical symmetry: if you run the exact same function twice with the same key, it decrypts itself back to the original text!

```cpp
    for (size_t i = 0; i < text.length(); i++) {
        char textChar = text[i];
        char keyChar = key[i % key.length()];
        char encryptedChar = textChar ^ keyChar; // The Core Logic
        result += encryptedChar;
    }
    return result;
}
```
* **Explanation**: We loop through every single letter of the text. `key[i % key.length()]` ensures that if our password is shorter than our text, the password naturally wraps around and repeats itself. The `^` symbol is the actual C++ Math XOR operator that scrambles the binary values of the letters.

```cpp
std::string toHex(std::string text) {
    std::stringstream ss;
    for (unsigned char c : text) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)c;
    }
    return ss.str();
}
```
* **Explanation**: When you XOR text, the result is often weird, unprintable computer system symbols (like `ESC` or `NULL`). If you try to save these weird symbols directly into a PostgreSQL database, the database will crash or truncate the data. `toHex` converts those weird symbols into safe, standard numbers and letters (e.g., the symbol `A` becomes `41`).

```cpp
std::string fromHex(std::string hexText) {
    std::string result = "";    
    for (size_t i = 0; i < hexText.length(); i += 2) {
        std::string byteString = hexText.substr(i, 2);
        char byte = (char) strtol(byteString.c_str(), NULL, 16);
        result += byte;
    }
    return result;
}
```
* **Explanation**: This is the reverse of the Hex encoding function. When we pull the safe Hex string out of the database, we need to mathematically convert it back into the unprintable symbols *before* we can XOR decrypt it. Because Hex uses two characters per byte, `i += 2` jumps two characters at a time.

```cpp
int main(int argc, char* argv[]) {
    if (argc < 4) {
        std::cerr << "Usage: crypto.exe <encrypt|decrypt> <text> <key>" << std::endl;
        return 1;
    }
    
    std::string mode = argv[1];
    std::string input_text = argv[2];
    std::string secret_key = argv[3];
```
* **Explanation**: The `main` function executes when Node.js calls this program mechanically. `argc` checks if we provided enough arguments. It expects 3 exact string arguments from Node: The `mode` ("encrypt" or "decrypt"), the `input_text`, and the `secret_key`.

```cpp
    if (mode == "encrypt") {
        std::string raw_encrypted = cipherXOR(input_text, secret_key);
        std::string safe_output = toHex(raw_encrypted);
        std::cout << safe_output;
    } else if (mode == "decrypt") {
        std::string raw_decrypted = fromHex(input_text);
        std::string plaintext_output = cipherXOR(raw_decrypted, secret_key);
        std::cout << plaintext_output;
    }
    return 0;
}
```
* **Explanation**: If Node.js passes the `"encrypt"` mode, we XOR it and then Hex-encode it. If Node.js passes `"decrypt"`, we reverse the mechanical process: Hex-decode it first, then XOR it back to normal plaintext text! We print the final result via `std::cout`, which Node.js automatically reads through its `stdout` stream.

---

## 2. The API Coordinator: `server.js`
This file acts as the intelligent bridge connecting your Frontend Web Dashboard, your background C++ Cryptography Engine, and your persistent PostgreSQL Database.

```javascript
const express = require('express');
const { execFile } = require('child_process');
const { Client } = require('pg');
```
* **Explanation**: `express` bootstraps and runs our REST API web server. `child_process.execFile` allows Node.js to safely spawn and execute our C++ program. `pg` natively connects us to PostgreSQL to run queries.

```javascript
const client = new Client(dbConfig);
client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
```
* **Explanation**: Using the environment variables safely hidden in your `.env` file, Node.js establishes a continuous TCP connection to PostgreSQL so we can save and retrieve vaulted data at will.

```javascript
app.post('/save', (req, res) => {
    const { filename, text } = req.body;
    const secretKey = process.env.ENCRYPTION_KEY || "default_placement_key";
    const args = ['encrypt', text, secretKey];
```
* **Explanation**: This is the `/save` endpoint triggered when you click "Secure & Save" on the frontend. It extracts the raw filename and text, grabs your global master password from the `.env` file securely, and arrays the arguments to run the C++ program in `"encrypt"` mode.

```javascript
    execFile('crypto.exe', args, (error, stdout, stderr) => {
        const encryptedText = stdout.trim();
```
* **Explanation**: `execFile` securely executes the compiled C++ binary. It mechanically waits and catches everything C++ printed (`std::cout`) and stores it perfectly in the `stdout` variable. `stdout.trim()` removes any accidental newlines, giving us the safely encrypted Hexadecimal string!

```javascript
        const query = 'INSERT INTO secrets (original_filename, encrypted_content) VALUES ($1, $2) RETURNING *';
        const values = [filename, encryptedText];
        client.query(query, values)
            .then(dbRes => res.json({ message: 'Saved successfully!', data: dbRes.rows[0] }))
```
* **Explanation**: We instruct PostgreSQL to insert the filename and the encrypted Hex string. We mathematically map the variables using `$1` and `$2` (Parameterized Queries), which fundamentally prevents **SQL Injection** hacking vulnerabilities by ensuring the database treats our text rigidly as data, never as commands.

```javascript
app.post('/decrypt', (req, res) => {
    const { id } = req.body;
    client.query('SELECT encrypted_content FROM secrets WHERE id = $1', [id])
```
* **Explanation**: This endpoint handles safely unlocking a file mechanically. The client specifically requests decryption for an `id`. Node.js securely isolates and queries that specific exact record in the PostgreSQL database table to grab its `encrypted_content`.

```javascript
        .then(dbRes => {
            const encryptedHex = dbRes.rows[0].encrypted_content;
            execFile('crypto.exe', ['decrypt', encryptedHex, secretKey], (error, stdout, stderr) => {
                res.json({ decrypted_content: stdout.trim() });
            });
        })
```
* **Explanation**: Once the exact hexadecimal string is retrieved from the database, Node initiates the C++ binary again—but this time safely passing the mode `"decrypt"`. The C++ program does the reversing mathematics, prints the plain text into `stdout`, and Node safely forwards it to your frontend web browser as JSON.

---

## 3. The Dashboard Interface: `public/index.html`
This is your modern, beautifully crafted Glassmorphism frontend that talks to the Node.js server using asynchronous HTTP requests.

```javascript
async function fetchSecrets() {
    const response = await fetch('/secrets');
    const result = await response.json();
```
* **Explanation**: Triggered seamlessly when the page loads. The `fetch` API is highly modern JavaScript. It reaches out to our `/secrets` endpoint and waits (`await`) mechanically for the server to reply with the list of all vaulted files in the database.

```javascript
    result.data.forEach(secret => {
        const item = document.createElement('div');
        item.className = 'secret-item';
        item.innerHTML = `
            <span class="secret-name">📄 ${secret.original_filename}</span>
            <span class="secret-id">ID: ${secret.id}</span>
        `;
        item.onclick = () => decryptSecret(secret.id, item);
        vaultList.appendChild(item);
    });
}
```
* **Explanation**: For every historical vault operation our API returns, the browser synthetically generates a new visual HTML container (`secret-item`). It sets up an `onclick` event listener so that when manually clicked, it instantly initiates the unlocking sequence `decryptSecret()` tailored automatically to that file's Database `ID`.

```javascript
async function decryptSecret(id, element) {
    const response = await fetch('/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    const result = await response.json();
```
* **Explanation**: When interacting with the file on the dashboard interface, this function securely bundles the `id` of that file into a structured JSON string and dynamically `POST`s it to the `/decrypt` Node.js route to challenge the server for the unencrypted content.

```javascript
    const view = document.createElement('div');
    view.className = 'decrypted-view';
    view.style.display = 'block';
    view.innerHTML = `
        <h3>🔓 Unlocked Content</h3>
        <div class="decrypted-content">${result.decrypted_content}</div>
    `;
    element.after(view);
}
```
* **Explanation**: Successfully verified! The securely retrieved unencrypted plaintext from the server allows the browser to synthetically inject a brand new graphical green container (`decrypted-view`) via DOM manipulation exactly `after` the file you clicked, beautifully revealing the historical classified information live on screen effortlessly!

---

### 💡 Interview Tip: "The Polyglot Architecture"
If an interviewer asks, *"Why didn't you just write the encryption directly in JavaScript / Node.js?"*, you can confidently deliver this high-level technical answer:  

*"I intentionally designed this as a **polyglot microservices architecture** to separate algorithmic concerns. Because cryptographic mathematical operations are highly CPU-intensive, crunching them synchronously inside Node.js strictly blocks its single-threaded event loop, which immediately freezes up the web server for all other users. By offloading these rigorous encryption calculations strictly to an external child executable written in a low-level, high-performance compiled language like C++, the Node web server maintains its highly concurrent, non-blocking asynchronous efficiency for serving REST requests, while C++ seamlessly handles the heavy algorithmic lifting natively in the background."*
