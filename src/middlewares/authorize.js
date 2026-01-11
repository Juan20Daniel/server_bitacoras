const { handleError } = require('../utils/error');
const authorize = (autorizedRoles) => {
    return (req, res, next) => {
        const staff = req.staff;
        if(!autorizedRoles.includes(staff.role)) return next(new handleError('No autorizado', 'UNAUTORIZED_ERR'))
        next();
    }
}

module.exports = {
    authorize
}