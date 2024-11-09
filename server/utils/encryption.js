const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

const encrypt = (data) => {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted;
  if (Buffer.isBuffer(data)) {
    encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  } else {
    encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  }
  
  return {
    encryptedData: encrypted.toString('hex'),
    key: key.toString('hex'),
    iv: iv.toString('hex')
  };
};

const decrypt = (encryptedData, key, iv) => {
  const decipher = crypto.createDecipheriv(
    algorithm, 
    Buffer.from(key, 'hex'), 
    Buffer.from(iv, 'hex')
  );
  
  let decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final()
  ]);
  
  return decrypted;
};

module.exports = { encrypt, decrypt };