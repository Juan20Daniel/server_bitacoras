const bcrypt = require('bcrypt');

const encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(15);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

const comparePasswords = (userPass, passwordDB) => {
    return bcrypt.compareSync(userPass, passwordDB);
}

module.exports = {
    encryptPassword,
    comparePasswords
}