-- Database Setup for Secure File Vault
-- Run this in your PostgreSQL database (e.g., via psql or pgAdmin)

CREATE TABLE secrets (
    id SERIAL PRIMARY KEY,
    original_filename TEXT NOT NULL,
    encrypted_content TEXT NOT NULL
);
