const bcrypt = require('bcrypt');

(async () => {
  const newPassword = 'admin'; // Your desired password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  console.log('Hashed Password:', hashedPassword);
})();
