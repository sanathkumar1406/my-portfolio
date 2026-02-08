import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
    console.log('Please provide a password as an argument.');
    process.exit(1);
}

const hash = await bcrypt.hash(password, 8);
console.log(`\nPassword: ${password}`);
console.log(`Hash: ${hash}`);
console.log('\nAdd this hash to your .env file as ADMIN_PASSWORD_HASH');
