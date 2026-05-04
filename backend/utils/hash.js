// Simple salted hash (upgrade to bcrypt in production)
const hash = (str) => Buffer.from(str + '_krishisetu_2026_salt').toString('base64');

module.exports = { hash };
