const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt, simpleHash } = require('./encryption');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const encryptToken = async (token) => {
  try {
    return encrypt(token);
  } catch (error) {
    console.error('Token encryption failed, falling back to hash:', error);
    return await hashPassword(token);
  }
};

const decryptToken = (encryptedToken) => {
  try {
    return decrypt(encryptedToken);
  } catch (error) {
    console.error('Token decryption failed:', error);
    throw new Error('Unable to decrypt token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  encryptToken,
  decryptToken
};

