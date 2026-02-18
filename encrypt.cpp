#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>

// Function: XOR Encryption
// Concept: We mix the 'text' with a 'key' using binary logic.
// If you XOR the same text with the key again, you get the original text back!
std::string encryptXOR(std::string text, std::string key) {
    std::string result = "";
    
    // Loop through the text
    for (size_t i = 0; i < text.length(); i++) {
        // Get the current character from text
        char textChar = text[i];
        
        // Get the corresponding character from key (looping the key if it's short)
        char keyChar = key[i % key.length()];
        
        // The Magic: XOR Operation (^)
        char encryptedChar = textChar ^ keyChar; 
        
        result += encryptedChar;
    }
    return result;
}

// Function: Convert to Hexadecimal
// Concept: Encryption creates weird symbols. We convert them to "A1 B2" style
// so they don't break the database or Node.js.
std::string toHex(std::string text) {
    std::stringstream ss;
    for (unsigned char c : text) { // Use unsigned char to avoid negative values
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)c;
    }
    return ss.str();
}

int main(int argc, char* argv[]) {
    // Safety Check: We need Text AND a Key now
    if (argc < 3) { 
        std::cerr << "Usage: encrypt.exe <text> <key>" << std::endl;
        return 1; 
    }

    std::string input_text = argv[1];
    std::string secret_key = argv[2];

    // 1. Encrypt
    std::string raw_encrypted = encryptXOR(input_text, secret_key);
    
    // 2. Encode to Safe Hex
    std::string safe_output = toHex(raw_encrypted);

    std::cout << safe_output;
    return 0;
}
