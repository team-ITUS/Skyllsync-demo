function generatePassword() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789@#';
    let password = '';
    const passwordLength = 6;
    
    for (let i = 0; i < passwordLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }

    return password;
}

module.exports = generatePassword;