const { CheckOut, Staff } = require('../models');
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
    fromUnixDateToDateFormat
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
    { value: "Selfie", key: "selgie", width: 40 },
    { value: "Nombre", key: "nombre", width: 20 },
    { value: "Apellidos", key: "email", width: 20 },
    { value: "Fecha", key: "estado", width: 15 },
    { value: "Hora de salida", key: "estado", width: 20 },
    { value: "Hora de llegada", key: "estado", width: 20 },
    { value: "Motivo", key: "estado", width: 30 },
    { value: "Estado", key: "estado", width: 20 },
]

const staffDepartureReport = async (req, res, next) => {
    try {
        const {initialDate, finalDate} = req.query;
        
        const initialUnixDate = fromStringDateToUnixDate(initialDate);
        const finalUnixDate = fromStringDateToUnixDate(finalDate);
       
        if(initialUnixDate > finalUnixDate) {
            return next(new handleError("Rango de fecha invalido", "RANGE_ERR"));
        }

        const checkOut = await CheckOut.findAll({
            attributes:['reason','departure_time','arrival_time','selfie_img','status','start_date'],
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
            }
        });

        if(checkOut.length <= 0) {
            return next(new handleError("No se encontraron registros", "NOT_FOUND_ERR"));
        }
        //Generar el Excel
        const workbook = createWorkbook();
        //Agregar hoja al excel
        const worksheet = createWorksheet(workbook);

        addHeader(columnsHeaderStaffDeparture, worksheet);

        //Centrar horiozontal y verticalmente el campo Estado.
        worksheet.getRow(1).getCell(7).alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        //Generar las filas
        checkOut.forEach(checkOut => {
            const selfieName = checkOut.selfie_img??'';
            const selfieUrl = selfieName !== '' ? `${BASE_SELFIE_URL}/${checkOut.selfie_img}` : '';
            const row = worksheet.addRow([
                `${selfieUrl}`,
                `${checkOut.staff.firstname}`,
                `${checkOut.staff.lastname}`,
                `${checkOut.start_date}`,
                `${checkOut.departure_time??''}`,
                `${checkOut.arrival_time??''}`,
                `${checkOut.reason}`,
                `${status[checkOut.status]}`
            ]);
            
            row.alignment = {
                vertical: "middle",
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
        console.log(error);
        next(new handleError('Error al descargar el reporte', error));
    }
}

const vehicleExitReport = async (req, res, next) => {
     try {
        const {initialDate, finalDate} = req.query;
        
        const initialUnixDate = fromStringDateToUnixDate(initialDate);
        const finalUnixDate = fromStringDateToUnixDate(finalDate);
       
        if(initialUnixDate > finalUnixDate) {
            return next(new handleError("Rango de fecha invalido", "RANGE_ERR"));
        }

        const checkOut = await CheckOut.findAll({
            attributes:['reason','departure_time','arrival_time','selfie_img','status','start_date'],
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
            }
        });

        if(checkOut.length <= 0) {
            return next(new handleError("No se encontraron registros", "NOT_FOUND_ERR"));
        }

        const workbook = createWorkbook();

        const worksheet = createWorksheet(workbook);

        addHeader(columnsHeaderStaffDeparture, worksheet);

        worksheet.getRow(1).getCell(7).alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        // console.log(checkOut);
        checkOut.forEach(checkOut => {
            const selfieName = checkOut.selfie_img??'';
            const selfieUrl = selfieName !== '' ? `${BASE_SELFIE_URL}/${checkOut.selfie_img}` : '';
            const row = worksheet.addRow([
                `${selfieUrl}`,
                `${checkOut.staff.firstname}`,
                `${checkOut.staff.lastname}`,
                `${checkOut.start_date}`,
                `${checkOut.departure_time??''}`,
                `${checkOut.arrival_time??''}`,
                `${checkOut.reason}`,
                `${status[checkOut.status]}`
            ]);
            
            row.alignment = {
                vertical: "middle",
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


//         worksheet.getRow(1).height = 25;
//         worksheet.getRow(1).font = {
//             size:15
//         };

//         worksheet.getRow(1).alignment = {
//             vertical: "middle",
//         };

//         worksheet.getRow(1).getCell(7).alignment = {
//             horizontal: "center",
//             vertical: "middle"
//         };

//             row.height = 25;
//             row.alignment = { vertical: "middle" };
//             const style = styles[checkOut.status];
            
//             const statusCell = row.getCell(7);
//             statusCell.fill = {
//                 type: "pattern",
//                 pattern: "solid",
//                 fgColor: { argb: style.fill }
//             };

//             statusCell.font = {
//                 color: { argb: style.font },
//                 bold: true
//             };

//             statusCell.alignment = { horizontal: "center", vertical: "middle", };
            
//         })

