const errorCode = require('../utils/errorCode');
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
        if(!searchResult) return res.status(500).json({ errorCode: errorCode.VALIDATION_ERR, field });
        if(!regexr[field].test(searchResult)) return res.status(500).json({ errorCode: errorCode.VALIDATION_ERR, field });
        next();
    }
}

module.exports = {
    checkField
};