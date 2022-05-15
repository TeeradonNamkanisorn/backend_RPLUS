const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const destinationCallback = (req, file, setDes) => {
    setDes(null, "./videos");
}

const filenameCallback = (req, file, setFileName) => {
    const formatName = file.originalname.split(' ').join('-');
    setFileName(null, uuidv4() + formatName);
}

const storage = multer.diskStorage({destination: destinationCallback, filename: filenameCallback})

const uploadLocal = multer({storage});

module.exports = uploadLocal;