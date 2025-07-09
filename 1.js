const bcrypt = require('bcrypt');

(async () => {
  const newPassword = 'datta'; // Your desired password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  console.log('Hashed Password:', hashedPassword);
})();
