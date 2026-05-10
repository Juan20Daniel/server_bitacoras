const { handleError } = require('../utils/error');
const regexr = require('../utils/regexr');
const { removeImg } = require('../utils/file');

const searchField = (req, key) => {
    if(req.query[key]) return req.query[key];
    if(req.body) {
        const body = req.body[key]??false;
        if(body) return req.body[key];
    }
    if(req.params[key]) return req.params[key];
    return null;
}

const validateField = (field, required=true) => {
    return (req, res, next) => {
        const searchResult = searchField(req, field);
        if(!required && !searchResult) return next();
        console.log(req)
        if(!searchResult) {
            if(req.file) removeImg(req.file.filename);
            return next(new handleError('Error de validación '+field, 'VALIDATION_ERR'));
        }
        if(!regexr[field].test(searchResult)) {
            if(req.file) removeImg(req.file.filename);
            return next(new handleError('Error de validación '+field, 'VALIDATION_ERR'));
        }
        next();
    }
}

module.exports = {
    validateField
};