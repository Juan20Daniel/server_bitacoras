const jwt = require('jsonwebtoken');

const createToken = (data) => {
    return jwt.sign(data, process.env.SECRET_KEY);
}

const decodeToken = (token) => {
    try {
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {
    createToken,
    decodeToken
}