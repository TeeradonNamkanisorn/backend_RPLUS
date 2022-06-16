const download = require('download');

// File URL
const url = `https://acquirebase.com/img/logo.png`;

// Download the file
(async () => {
    await download(url, './');
})();