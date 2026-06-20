const bcrypt = require('bcrypt');
const characters = 'aA2bB1cC0dD9e8E7fF6g5Gh4H3i1I2jJkK2m3Mn1N4lLo0OpPq5QsSvVx6Xz9ZrR7Ty8YwW';

const encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(15);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

const comparePasswords = (userPass, passwordDB) => {
    return bcrypt.compareSync(userPass, passwordDB);
}

const generatePassword = () => {
    const newPass = Array.from(Array(8), (_, index) => index).map(i => {
        return characters[Math.floor(Math.random() * characters.length)]
    });
    
    return newPass.join('');
}

module.exports = {
    encryptPassword,
    comparePasswords,
    generatePassword
}