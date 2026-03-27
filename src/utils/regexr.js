const regexr = {
    city: /^[A-Za-záÁéÉíÍóÓúÚñÑ ]{5,30}$/,
    schoolType: /^[A-Za-záÁéÉíÍóÓúÚñÑ ]{5,30}$/,
    checkOutType: /^(staff|vehicular)$/,
    status: /^(programmed|initiated|finalized|canceled|incomplete)$/,
    type: /^(staff|vehicular)$/,
    staffId:/^[0-9]{1,}$/,
    vehicleId:/^[0-9]{1,}$/,
    deparment: /^[A-Za-záÁéÉíÍóÓúÚñÑ ]{5,40}$/,
    firstname: /^[A-Za-záÁéÉíÍóÓúÚñÑ ]{3,40}$/,
    lastname: /^[A-Za-záÁéÉíÍóÓúÚñÑ ]{3,40}$/,
    email: /^[a-zA-Z0-9._-]{3,50}@[a-zA-Z-0-9]{1,40}\.[a-zA-Z-0-9]{2,10}(.mx)?$/,
    password: /^.{1,100}$/,
    vehicle: /^[A-Za-z0-9áÁéÉíÍóÓúÚñÑ\- ]{10,35}$/,
    destination: /^[A-Za-z0-9áÁéÉíÍóÓúÚñÑ\s ]{4,50}$/,
    outletTankLavel: /^[A-Za-z0-9 íÍ/]{3,10}$/,
    reason: /^[A-Za-z0-9áÁéÉíÍóÓúÚñÑ\s. ]{4,50}$/,
    vehicleName: /^[A-Za-z0-9áÁéÉíÍóÓúÚñÑ ]{3,40}$/,
    initMileage:/^[0-9]{1,6}$/,
    initTankLavel:/^[A-Za-z0-9 íÍ/]{3,10}$/,
    campId: /^[0-9]{1,}$/,
    checkOutId: /^[0-9]{1,}$/,
    arrivalKm:/^[0-9]{1,6}$/,
    inputTankLavel:/^[A-Za-z0-9 íÍ/]{3,10}$/
}

module.exports = regexr;