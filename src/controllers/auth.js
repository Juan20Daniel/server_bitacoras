const { Staff } = require('../models');
const { handleError } = require('../utils/error');
const { createToken } = require('../utils/jwt');
const { comparePasswords, encryptPassword } = require('../utils/password');

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
        
        if(!staff) return next(new handleError("No encontrado", "NOT_FOUND_ERR"));
        if(!comparePasswords(password, staff.password)) return next( new handleError("No autorizado", "AUTH_ERR"));
        if(!staff.active) return next(new handleError("Cuenta inactiva", "ACCESS_ERR"));

        const tokenData = {
            staffId:staff.id,
            role:staff.role
        }
        const staffData = {
            staffId: staff.id,
            firstname:staff.firstname,
            lastname:staff.lastname,
            email:email,
            role: staff.role
        }
        const token = createToken(tokenData);
        res.status(200).json({
            message:'Sesión iniciada',
            token:`Bearer ${token}`,
            user:staffData
        });
    } catch (error) {
        next(new handleError('Error al iniciar sesión', error));
    }
}

const passwordVerification = async (req, res, next) => {
    try {
        const { password } = req.params;
        const passwords = await Staff.findAll({
            attributes:['password'],
            where:{role:'admin'},
            raw:true
        });
      
        const isValidPassword = passwords.some(p => {
            return comparePasswords(password, p.password);
        });
        
        if(!isValidPassword) {
            return next(new handleError('Contraseña incorrecta o la cuenta no existe', 'VALIDATION_ERR'));
        }

        res.status(200).json({
            message:'Verificación de contraseña',
            isValidPassword
        });
    } catch (error) {
        next(new handleError('Error al verificar la contraseña', error));
    }
}

const changePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const passwordEncrypted = encryptPassword(password);

        await Staff.update(
            {password:passwordEncrypted},
            {where: {id:id}}
        );

        res.status(200).json({message: 'Contraseña cambiada.'})
    } catch (error) {
        console.log(error);
        next(new handleError('Error al cambiar la contraseña', error));
    }
}

module.exports = {
    login,
    passwordVerification,
    changePassword
}