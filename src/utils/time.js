const dayjs = require('dayjs');

const expirationTime = 10

const getExpirationTime = () => dayjs().add(expirationTime, 'hours').unix();

const timeUnix = () => dayjs().unix();

module.exports = {
    expirationTime,
    getExpirationTime,
    timeUnix
}