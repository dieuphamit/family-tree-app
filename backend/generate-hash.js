// Script to generate admin password hash
// Run with: node generate-hash.js

const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function generateHash() {
    rl.question('Enter admin password: ', async (password) => {
        if (!password) {
            console.log('❌ Password cannot be empty');
            rl.close();
            return;
        }

        try {
            const hash = await bcrypt.hash(password, 10);
            console.log('\n✅ Password hash generated!');
            console.log('\nAdd this to your backend/.env file:');
            console.log('\nADMIN_PASSWORD_HASH=' + hash);
            console.log('\n');
        } catch (error) {
            console.error('❌ Error generating hash:', error);
        }

        rl.close();
    });
}

generateHash();
