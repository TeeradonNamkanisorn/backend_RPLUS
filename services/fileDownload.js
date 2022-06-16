const download = require('download');

const downloadFromUrl = async (url, dest, filename) => {
    await download(url, dest, {
        filename
    });
}

module.exports = downloadFromUrl;