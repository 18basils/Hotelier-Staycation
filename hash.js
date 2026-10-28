import bcrypt from './server/node_modules/bcryptjs/index.js';

const password = process.argv[2];
if (!password) {
  console.log('\n❌ Usage: node hash.js YourPasswordHere\n');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\n======================================================');
console.log('🔑 Your Encrypted Bcrypt Hash:');
console.log(hash);
console.log('======================================================');
console.log('👉 Copy the string above and paste it into the');
console.log('   password_hash field in Firebase Console!\n');
