const { handleError } = require('../utils/error');
const regexr = require('../utils/regexr');

const searchField = (req, key) => {
    if(req.hasOwnProperty('query') && req.query.hasOwnProperty(key)) return req.query[key];
    if(req.hasOwnProperty('body') && req.body.hasOwnProperty(key)) return req.body[key];
    if(req.params[key]) return req.params[key];
    return null;
}

const checkField = (field, required=true) => {
    return (req, res, next) => {
        const searchResult = searchField(req, field);
        if(!required && !searchResult) return next();
        if(!searchResult) return next(new handleError('Error de validación', 'VALIDATION_ERR'));
        if(!regexr[field].test(searchResult)) return next(new handleError('Error de validación', 'VALIDATION_ERR'));
        next();
    }
}

module.exports = {
    checkField
};