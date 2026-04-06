#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include <cstdlib>

// Function: XOR Encryption & Decryption
// XOR is symmetric. encrypt(encrypt(text, key), key) == text
std::string cipherXOR(std::string text, std::string key) {
    std::string result = "";
    if (key.length() == 0) return text;
    for (size_t i = 0; i < text.length(); i++) {
        char textChar = text[i];
        char keyChar = key[i % key.length()];
        char encryptedChar = textChar ^ keyChar; // The Core Logic
        result += encryptedChar;
    }
    return result;
}

// Function: Convert to Hexadecimal for safe database storage
std::string toHex(std::string text) {
    std::stringstream ss;
    for (unsigned char c : text) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)c;
    }
    return ss.str();
}

// Function: Convert from Hexadecimal back to raw string
std::string fromHex(std::string hexText) {
    std::string result = "";
    if (hexText.length() % 2 != 0) return result; // Safety check
    
    for (size_t i = 0; i < hexText.length(); i += 2) {
        std::string byteString = hexText.substr(i, 2);
        char byte = (char) strtol(byteString.c_str(), NULL, 16);
        result += byte;
    }
    return result;
}

int main(int argc, char* argv[]) {
    // Expected arguments: crypto.exe <mode> <text_or_hex> <key>
    if (argc < 4) {
        std::cerr << "Usage: crypto.exe <encrypt|decrypt> <text> <key>" << std::endl;
        return 1;
    }
    
    std::string mode = argv[1];
    std::string input_text = argv[2];
    std::string secret_key = argv[3];

    if (mode == "encrypt") {
        // 1. XOR Encrypt -> 2. Hex Encode
        std::string raw_encrypted = cipherXOR(input_text, secret_key);
        std::string safe_output = toHex(raw_encrypted);
        std::cout << safe_output;
    } else if (mode == "decrypt") {
        // 1. Hex Decode -> 2. XOR Decrypt
        std::string raw_decrypted = fromHex(input_text);
        std::string plaintext_output = cipherXOR(raw_decrypted, secret_key);
        std::cout << plaintext_output;
    } else {
        std::cerr << "Error: Invalid mode. Use 'encrypt' or 'decrypt'." << std::endl;
        return 1;
    }

    return 0;
}
