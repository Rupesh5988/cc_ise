# Secure File Vault 🔒

A simple project demonstrating how to connect a Frontend, Node.js Backend, C++ Logic, and PostgreSQL Database.

## 📂 Project Structure
- `encrypt.cpp` - The C++ program that performs the encryption.
- `server.js` - The Node.js server that handles requests.
- `db.sql` - SQL script to create the database table.
- `public/index.html` - The frontend user interface.

## 🚀 Setup & Run Instructions

### 1. Database Setup
1. Open **pgAdmin** or your PostgreSQL command line.
2. Create a new database (e.g., `vault_db`) or use an existing one.
3. Open the Query Tool and paste the content of `db.sql` to create the table.
4. **IMPORTANT:** Open `server.js` and update the `dbConfig` object with your actual PostgreSQL password!

### 2. Compile the C++ Program
Open a terminal in this folder and run:
```sh
g++ encrypt.cpp -o encrypt.exe
```
*(If you don't have `g++`, install MinGW or use another C++ compiler)*

### 3. Install Dependencies
Run this command to install the required Node.js libraries:
```sh
npm install
```

### 4. Start the Server
Run the server with:
```sh
node server.js
```
You should see: `Server running at http://localhost:3000`

### 5. Use the App
1. Open your browser and go to `http://localhost:3000`.
2. Enter a filename and some secret text.
3. Click **Secure Save**.
4. Check your database to see the encrypted content!
