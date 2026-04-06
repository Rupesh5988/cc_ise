# 🛡️ Secure File Vault

A modern, full-stack application demonstrating how to connect a visually stunning Frontend, a Node.js Backend, a bidirectional C++ Cryptography Engine, and a PostgreSQL Database. Perfect for learning backend integrations and showcasing robust security architectures in placements/interviews.

## ✨ Features
- **Modern Glassmorphism UI**: A beautiful, dark-themed responsive dashboard utilizing Vanilla CSS.
- **Bidirectional C++ Engine**: Custom XOR encryption and Hex-encoding/decoding engine written entirely in C++.
- **RESTful Node.js Backend**: Secure Express integration utilizing `child_process.execFile`.
- **PostgreSQL Database**: Safe, injection-proof storage of hexadecimal ciphertexts.

## 📂 Project Structure
- `crypto.cpp` - The C++ engine handling bidirectional encryption & decryption.
- `server.js` - Node.js Express server orchestrating the flows.
- `db.sql` - SQL script to initialize the PostgreSQL table.
- `public/index.html` - The Glassmorphism user interface.

## 🚀 Setup & Run Instructions

### 1. Database Setup
1. Open **pgAdmin** or your PostgreSQL CLI.
2. Create a new database (e.g., `vault_db`).
3. Run the content of `db.sql` to create the `secrets` table.
4. **Configuration**: Ensure you have a `.env` file in the root based on your PostgreSQL setup:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=vault_db
   DB_PASSWORD=your_password
   DB_PORT=5432
   ENCRYPTION_KEY=super_secret_master_key
   ```

### 2. Compile the C++ Engine
Open a terminal in this folder and compile the C++ cryptographic engine:
```sh
g++ crypto.cpp -o crypto.exe
```

### 3. Install NPM Dependencies
If you haven't already:
```sh
npm install
```

### 4. Start the Server
```sh
node server.js
```
*You should see: `Server running at http://localhost:3000`*

### 5. Launch the Vault
1. Open your browser and navigate to `http://localhost:3000`.
2. **Vault a File**: Enter a filename, some classified information, and click "Secure & Save to Vault".
3. **Access Vault**: Click on any historically vaulted file in the dashboard to decrypt and view it live on screen!
