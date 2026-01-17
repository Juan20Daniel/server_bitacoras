const { handleError } = require('../utils/error');
const validateImage = (required=true) => {
    return (req, res, next) => {
        if(!required) return next();
        if(!req.file) {
            return next(new handleError('Error de validación', 'VALIDATION_ERR'));
        }
        next();
    }
}

module.exports = {
    validateImage
}