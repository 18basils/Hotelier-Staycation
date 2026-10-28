import bcrypt from 'bcryptjs';
import { usersCol } from './firestore.js';

const newPassword = process.argv[2];

if (!newPassword || newPassword.length < 6) {
  console.error('\n❌ Error: Please provide a password with at least 6 characters.');
  console.log('Usage: npm run set-admin-password -- <your_new_password>');
  console.log('Example: npm run set-admin-password -- MySuperSecretPass@2026\n');
  process.exit(1);
}

try {
  console.log('🔐 Hashing password with bcrypt...');
  const passwordHash = bcrypt.hashSync(newPassword, 10);

  console.log('📡 Updating admin document in Cloud Firestore (hotelierstays)...');
  await usersCol.doc('admin').set(
    {
      username: 'admin',
      email: 'admin@hotelierstays.com',
      password_hash: passwordHash,
      full_name: 'System Administrator',
      role: 'ADMIN',
      updated_at: new Date().toISOString()
    },
    { merge: true }
  );

  console.log('\n======================================================');
  console.log('✅ Admin password updated successfully in Cloud Firestore!');
  console.log('🔒 Username: admin');
  console.log('🔑 Password: [PROTECTED]');
  console.log('======================================================\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to update admin password in Firestore:', error);
  process.exit(1);
}
