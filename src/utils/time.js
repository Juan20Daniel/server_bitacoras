const dayjs = require('dayjs');
const utc = require("dayjs/plugin/utc");

const expirationTime = 10

const getExpirationTime = () => dayjs().add(expirationTime, 'hours').unix();

const timeUnix = () => dayjs().unix();

const getDaysInMonth = (month, year) => {
    return dayjs().set('year', year).set('month', month).daysInMonth();
}

const fromStringDateToUnixDate = (date) => {
    const [ day, mount, year ] = date.split('/');
    return dayjs(`${year}-${mount}-${day}`).unix();
}

const addUnixDay = (date, days) => {
    return dayjs.unix(date).add(days, 'days').unix()
}

const removeHours = (date, hours) => {
    return dayjs.unix(date).subtract(hours, 'hours').unix()
}

const fromUnixDateToDateFormat = (date) => {
    return dayjs.unix(date).format("YYYY-MM-DD");
}

const fromDbDateToNormalDate = (date) => {
    dayjs.extend(utc);
    const formatDate = dayjs.utc(date).local().format("DD-MM-YYYY");
    return formatDate.replace(/-/g,'/');
}

const fromDbDateToUnix = (date) => {
    const formatDate = dayjs.utc(date).local().unix();
    return formatDate
}

const getDayAndHour = () => {
    const daysName = {
        0:"Domingo",
        1:"Lunes",
        2:"Martes",
        3:"Miércoles",
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
    getDayAndHour,
    getDaysInMonth,
    fromStringDateToUnixDate,
    fromUnixDateToDateFormat,
    fromDbDateToNormalDate,
    fromDbDateToUnix,
    removeHours,
    addUnixDay
}