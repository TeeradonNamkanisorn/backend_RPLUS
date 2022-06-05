const fs = require('fs');
const path = require('path');

const directory = './media';
const certDir = "./certificates";

const clearMediaLocal = () => {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
          });
        }
      });
}

const clearCertificateDir = () => {
    fs.readdir(certDir, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(certDir, file), err => {
            if (err) throw err;
          });
        }
      });
}

module.exports = { clearMediaLocal, clearCertificateDir }