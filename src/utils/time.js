const dayjs = require('dayjs');

const expirationTime = 10

const getExpirationTime = () => dayjs().add(expirationTime, 'hours').unix();

const timeUnix = () => dayjs().unix();

const getDayAndHour = () => {
    const daysName = {
        0:"Domingo",
        1:"Lines",
        2:"Martes",
        3:"Miercoles",
        4:"Jueves",
        5:"Viernes",
        6:"Sábado"
    }
    const day = dayjs().day();
    const actualHour = dayjs().hour();
    const actualMinute = dayjs().minute();
    
    const eightFormat = actualHour >= 12 ? actualHour-12 : actualHour;
    const hour = !eightFormat 
        ? 12 
        : eightFormat < 10 
            ? '0'+eightFormat 
            : eightFormat

    const minute = actualMinute < 10 
        ? '0'+actualMinute 
        : actualMinute
    
    const time = actualHour >= 12 ? 'p.m' : 'a.m'
    
    return `${daysName[day]} ${hour}:${minute} ${time}`;
}

module.exports = {
    expirationTime,
    getExpirationTime,
    timeUnix,
    getDayAndHour
}