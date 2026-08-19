const multer = require('multer');
const path = require('path');
const { handleError } = require('../utils/error');
const { timeUnix } = require('../utils/time');
const { randomNum } = require('../utils/randomNum');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `public/temp`);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${timeUnix()}-${randomNum()}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new handleError('Formato de imagen no permitido', 'VALIDATION_ERR'));
    }
});

module.exports = {
    upload
}