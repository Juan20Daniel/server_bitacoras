const Staff = require('../models/staff');
const { handleError } = require('../utils/error');
const { createToken } = require('../utils/jwt');
const { comparePasswords } = require('../utils/password');

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const staff = await Staff.findOne({
            attributes:['id', 'firstname', 'lastname', 'password','active', 'role'],
            where: {
                email:email
            },
            raw:true
        });
        if(!staff) throw new handleError("No encontrado", "NOT_FOUND_ERR");
        if(!comparePasswords(password, staff.password)) throw new handleError("No autorizado", "AUTH_ERR");
        if(!staff.active) throw new handleError("Cuenta inactiva", "ACCESS_ERR");

        const tokenData = {
            staffId:staff.id,
            role:staff.role
        }
        const staffData = {
            staffId: staff.id,
            firstname:staff.firstname,
            lastname:staff.lastname,
            email:email
        }
        const token = createToken(tokenData)
        res.status(200).json({
            message:'Sesión iniciada',
            token:`Bearer ${token}`,
            data:staffData
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    login
}