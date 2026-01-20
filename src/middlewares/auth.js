const Staff = require('../models/staff');
const { decodeToken } = require('../utils/jwt');
const { handleError } = require('../utils/error');

const auth = async (req, res, next) => {
        try {
        const authHeader = req.headers.authorization;
       
        if(!authHeader || !authHeader.startsWith('Bearer ')) return next(new handleError('No autenticado', 'AUTH_ERR'));
        
        const token = authHeader.split(' ').pop();
        const tokenDecoded = decodeToken(token);
        if(!tokenDecoded) return next(new handleError('No autenticado', 'AUTH_ERR'));

        const isActiveCount = await Staff.findOne({
            attributes: ['active'],
            where:{
                id:tokenDecoded.staffId
            },
            raw:true
        });
        if(!isActiveCount || !isActiveCount.active) return next(new handleError("Cuenta inactiva", "ACCESS_ERR"));
        
        req.staff = tokenDecoded;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    auth
}