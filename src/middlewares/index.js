const {auth} = require('./auth');
const {authorize} = require('./authorize');
const {upload} = require('./multer');
const {setUploadFolder} = require('./setUploadFolder');
const {validateField} = require('./validateField');
const {validateImage} = require('./validateImage');

module.exports = {
    auth,
    authorize,
    upload,
    setUploadFolder,
    validateField,
    validateImage
}