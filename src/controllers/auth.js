const { Staff } = require('../models');
const { handleError } = require('../utils/error');
const { sendEmail } = require('../utils/email');
const { createToken } = require('../utils/jwt');
const { emailTemplate } = require('../emailTemplete/emailTemplate');
const { 
    comparePasswords,
    encryptPassword,
    generatePassword
} = require('../utils/password');

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const staff = await Staff.findOne({
            attributes:[
                'id',
                'firstname',
                'lastname',
                'email',
                'active',
                'role',
                'folio',
                'password'
            ],
            where: {
                email:email
            },
            raw:true
        });
        
        if(!staff) {
            return next(new handleError("No encontrado", "NOT_FOUND_ERR"));
        }

        if(!comparePasswords(password, staff.password)) {
            return next(new handleError("No autorizado", "AUTH_ERR"));
        }

        if(!staff.active) {
            return next(new handleError("Cuenta inactiva", "ACCESS_ERR"));
        }

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
        res.status(201).json({
            message:'Sesión iniciada',
            token:`Bearer ${token}`,
            user:staffData
        });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al iniciar sesión', "SERVER_ERR"));
    }
}

const passwordVerification = async (req, res, next) => {
    try {
        const { password } = req.params;
        const passwords = await Staff.findAll({
            attributes: ['password'],
            where: {role:'admin'},
            raw: true
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
        next(new handleError('Error al verificar la contraseña', "SERVER_ERR"));
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

        res.status(200).json({message: 'Contraseña cambiada.'});
    } catch (error) {
        console.log(error);
        next(new handleError('Error al cambiar la contraseña', "SERVER_ERR"));
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await Staff.findOne({where:{email:email}});

        if(!user) {
            return res.status(200).json({message: `Contraseña enviada al correo ${email}`});
        }

        const password = generatePassword();

        const passwordEncrypted = encryptPassword(password);

        await Staff.update(
            {password:passwordEncrypted},
            {where:{id:user.id}}
        );

        const htmlTemplate = emailTemplate(password);
        const result = await sendEmail(user.email, 'Solicitud de restablecimiento de contraseña', htmlTemplate);
        
        res.status(201).json({message: `Contraseña enviada al correo ${email}`});
    } catch (error) {
        console.log(error);
        next(new handleError('Error al recuperar la contraseña', "SERVER_ERR"));
    }
}

const getEmployeeRole = (req, res, next) => {
    try {
        res.status(201).json({message: `Rol del usuairo`, userRol:req.staff.role});
    } catch (error) {
        console.log(error);
        next(new handleError('Error al obtener el rol del usuario', "SERVER_ERR"));
    }
}

module.exports = {
    login,
    passwordVerification,
    changePassword,
    resetPassword,
    getEmployeeRole
}