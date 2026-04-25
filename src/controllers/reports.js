const { CheckOut, Staff, CheckOutVehicular, Vehicle } = require('../models');
const { Op } = require("sequelize");
const { handleError } = require("../utils/error");
const { 
    createWorkbook, 
    createWorksheet, 
    addHeader, 
    addBorderAndHeight
} = require('../utils/excel');
const {
    fromStringDateToUnixDate,
    fromUnixDateToDateFormat,
    fromDbDateToNormalDate,
    fromDbDateToUnix,
    timeUnix,
    getDaysInMonth
} = require('../utils/time');

const status = {
    'initiated':'Iniciada',
    'canceled':'Cancelada',
    'incomplete':'Incompleta',
    'finalized':'Completo'
}

const BASE_SELFIE_URL = `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/api/v1/image/selfie`;

const styles = {
    initiated: {
        fill: "FFFFFFFF", // blanco
        font: "FF000000"  // negro
    },
    canceled: {
        fill: "FFFFC000", // amarillo
        font: "FF000000"  // negro
    },
    incomplete: {
        fill: "FFFF0000", // rojo
        font: "FFFFFFFF"  // blanco
    },
    finalized: {
        fill: "FF00B050", // verde
        font: "FFFFFFFF"  // blanco
    }
};

const columnsHeaderStaffDeparture = [
    { value: "Selfie", key: "selgie", width: 15 },
    { value: "Nombre", key: "nombre", width: 20 },
    { value: "Apellidos", key: "email", width: 20 },
    { value: "Fecha", key: "estado", width: 15 },
    { value: "Hora de salida", key: "estado", width: 20 },
    { value: "Hora de llegada", key: "estado", width: 20 },
    { value: "Motivo", key: "estado", width: 30 },
    { value: "Estado", key: "estado", width: 20 },
];

const columnsHeaderVehicleExit = [
    { value: "FECHA", key: "date", width: 12 },
    { value: "CONDUCTOR", key: "driver", width: 20 },
    { value: "DESTINO", key: "destination", width: 20 },
    { value: "HORA DE SALIDA", key: "departureTime", width: 20 },
    { value: "KM SALIDA", key: "departureKm", width: 13 },
    { value: "TANQUE DE SALIDA", key: "outletTankLavel", width: 21 },
    { value: "HORA DE REGRESO", key: "arrivalTime", width: 20 },
    { value: "KM REGRESO", key: "arrivalKm", width: 15 },
    { value: "TANQUE DE REGRESO", key: "inputTankLavel", width: 22 },
    { value: "MOTIVO", key: "reason", width: 30 },
    { value: "TIEMPO FUERA", key: "timeOut", width: 17 },
    { value: "KM RECORRIDO", key: "mileageTraveled", width: 17 },
    { value: "VEHICULO", key: "vehicle", width: 25 },
];

const updateExpirationDate = async (expireCheckOutIds) => {
    try {
        await CheckOut.update(
            {status:'incomplete'},
            {where:{id:expireCheckOutIds}}
        );
    } catch (error) {
        throw error;
    }
}

const processCheckOutsExpireds = async (checkOuts) => {
    const now = timeUnix();
    const checkExpirationDate = checkOuts.filter(checkOut => {
        const {expiration_time, status} = checkOut;
        return (now > expiration_time && status === "initiated");
    });

    if(checkExpirationDate.length > 0 ) {
        const expireCheckOutIds = checkExpirationDate.map(c => c.id);
        
        checkOuts = checkOuts.map(checkOut => {
            return expireCheckOutIds.includes(checkOut.id)
                ? {...checkOut, status:'incomplete'}
                : checkOut;
        });
        await updateExpirationDate(expireCheckOutIds);
        return checkOuts;
    }
}

const staffDepartureReport = async (req, res, next) => {
    try {
        const {initialDate, finalDate} = req.query;
        
        const initialUnixDate = fromStringDateToUnixDate(initialDate);
        const finalUnixDate = fromStringDateToUnixDate(finalDate);
       
        if(initialUnixDate > finalUnixDate) {
            return next(new handleError("Rango de fecha invalido", "RANGE_ERR"));
        }

        const checkOuts = await CheckOut.findAll({
            attributes:['id','reason','departure_time','arrival_time','selfie_img','status','expiration_time','start_date'],
            include: [
                {
                    model:Staff,
                    as:'staff',
                    attributes:['id','firstname','lastname']
                }
            ],
            where: {
                status: {
                    [Op.in]:['initiated','canceled','incomplete','finalized'],
                },
                start_date: {
                    [Op.between]:[
                        fromUnixDateToDateFormat(initialUnixDate),
                        fromUnixDateToDateFormat(finalUnixDate)
                    ]
                }
            },
            raw:true
        });

        if(checkOuts.length <= 0) {
            return next(new handleError("No se encontraron registros", "NOT_FOUND_ERR"));
        }

        processCheckOutsExpireds(checkOuts);

        //Generar el Excel
        const workbook = createWorkbook();
        //Agregar hoja al excel
        const worksheet = createWorksheet(workbook);

        addHeader(columnsHeaderStaffDeparture, worksheet);

        //Centrar horiozontal y verticalmente el campo Estado.
        worksheet.getRow(1).getCell(8).alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        //Generar las filas
        checkOuts.forEach(checkOut => {
            const selfieName = checkOut.selfie_img??'';
            const selfieUrl = selfieName !== '' ? `${BASE_SELFIE_URL}/${checkOut.selfie_img}` : null;
            const selfieLink = selfieUrl
                ?   {
                        text:'Ver selfie',
                        hyperlink:`${selfieUrl}`
                    }
                :   ''
            const startDate = fromDbDateToNormalDate(checkOut.start_date);
            const row = worksheet.addRow([
                selfieLink,
                `${checkOut['staff.firstname']}`,
                `${checkOut['staff.lastname']}`,
                `${startDate}`,
                `${checkOut.departure_time??''}`,
                `${checkOut.arrival_time??''}`,
                `${checkOut.reason}`,
                `${status[checkOut.status]}`
            ]);
            
            row.alignment = {
                vertical: "middle",
            }
            const selfieCell = row.getCell(1);
            selfieCell.font = {
                color: { argb: "FF1A66AC" },
                underline: true
            }

            const statusStyle = styles[checkOut.status];

            const statusCell = row.getCell(8);

            statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: statusStyle.fill }
            };

            statusCell.font = {
                color: { argb: statusStyle.font },
                bold: true
            };

            statusCell.alignment = { 
                horizontal: "center", 
                vertical: "middle", 
            };
        })

        addBorderAndHeight(worksheet);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reporte.xlsx"
        );
         
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(new handleError('Error al descargar el reporte', error));
    }
}

const normalizeMonth = (month) => {
    if(month.startsWith('0')) {
        return Number(month.replace('0',''));
    }
    return Number(month);
}

const vehicleExitReport = async (req, res, next) => {
     try {
        const { monthAndYear } = req.query;
        const [ month, year ] = monthAndYear.split('/');
        const monthNormalized = normalizeMonth(month);

        if(monthNormalized >= 13) {
            return next(new handleError("El mes o el año no es válido", "VALIDATION_ERR"));
        }

        const daysInMonth = getDaysInMonth(monthNormalized-1, +year);

        const initialDate = `${year}-${month}-01`;
        const finalDate = `${year}-${month}-${daysInMonth}`;

        const checkOuts = await CheckOut.findAll({
            attributes:['reason','departure_time','arrival_time','status','start_date','finish_date'],
            include: [
                {
                    model:Staff,
                    as:'staff',
                    attributes:['id','firstname']
                },
                {
                    model: CheckOutVehicular,
                    as: 'checkOutVehicular',
                    attributes:['id','departure_km','arrival_km', 'outlet_tank_lavel', 'input_tank_lavel', 'destination'],
                    include: {
                        model:Vehicle,
                        as: 'vehicle',
                        attributes:['id', 'name']
                    }
                }
            ],
            where: {
                status: {
                    [Op.in]:['initiated','canceled','incomplete','finalized'],
                },
                check_Out_type:'vehicular',
                start_date: {
                    [Op.between]:[initialDate, finalDate]
                }
            }
        });

        if(checkOuts.length <= 0) {
            return next(new handleError("No se encontraron registros", "NOT_FOUND_ERR"));
        }
        processCheckOutsExpireds(checkOuts);

        const workbook = createWorkbook();

        const worksheet = createWorksheet(workbook);

        addHeader(columnsHeaderVehicleExit, worksheet);

        checkOuts.forEach(checkOut => {
            let timeOut = '';
            let mileageTraveled = undefined;

            if(checkOut.arrival_time) {
                const startDate = fromDbDateToUnix(checkOut.start_date);
                const finishDate = fromDbDateToUnix(checkOut.finish_date);
                const diffSeconds = finishDate-startDate;
                const minutes = Math.floor((diffSeconds % 3600) / 60);
                const hours = Math.floor(diffSeconds / 3600);
                timeOut = `${hours}:${minutes}`;

                const departureKm = checkOut.checkOutVehicular.departure_km;
                const arrivalKm = checkOut.checkOutVehicular.arrival_km;
                mileageTraveled = arrivalKm - departureKm;
            }

            const startDate = fromDbDateToNormalDate(checkOut.start_date);
            const row = worksheet.addRow([
                `${startDate}`,
                `${checkOut.staff.firstname}`,
                `${checkOut.checkOutVehicular.destination}`,
                `${checkOut.departure_time}`,
                checkOut.checkOutVehicular.departure_km,
                `${checkOut.checkOutVehicular.outlet_tank_lavel}`,
                `${checkOut.arrival_time}`,
                checkOut.checkOutVehicular.arrival_km,
                `${checkOut.checkOutVehicular.input_tank_lavel}`,
                `${checkOut.reason}`,
                timeOut,
                mileageTraveled,
                checkOut.checkOutVehicular.vehicle.name,
            ]);
            
            row.alignment = {
                vertical: "middle",
            }
            row.getCell(5).alignment = {
                horizontal: "center",
                vertical: "middle"
            }
            row.getCell(6).alignment = {
                horizontal: "center",
                vertical: "middle"
            }
            row.getCell(8).alignment = {
                horizontal: "center",
                vertical: "middle"
            }
            row.getCell(9).alignment = {
                horizontal: "center",
                vertical: "middle"
            }
            row.getCell(11).alignment = {
                horizontal: "center",
                vertical: "middle"
            }
            row.getCell(12).alignment = {
                horizontal: "center",
                vertical: "middle"
            }
        });

        //Agregar alto y borde a todas las celdas
        addBorderAndHeight(worksheet);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reporte.xlsx"
        );
         
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
        next(new handleError('Error al descargar el reporte', error));
    }
}

module.exports = {
    staffDepartureReport,
    vehicleExitReport
}