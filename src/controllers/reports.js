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
    addUnixDay,
    getMonthName,
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
    { key: "date", width: 15 },
    { key: "driver", width: 20 },
    { key: "destination", width: 20 },
    { key: "departureTime", width: 20 },
    { key: "departureKm", width: 13 },
    { key: "outletTankLavel", width: 21 },
    { key: "arrivalTime", width: 20 },
    { key: "arrivalKm", width: 15 },
    { key: "inputTankLavel", width: 22 },
    { key: "reason", width: 30 },
    { key: "timeOut", width: 17 },
    { key: "mileageTraveled", width: 17 },
    { key: "state", width: 17 }
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
        let finalUnixDate = fromStringDateToUnixDate(finalDate);
        
        if(initialUnixDate > finalUnixDate) {
            return next(new handleError("Rango de fecha invalido", "RANGE_ERR"));
        }

        finalUnixDate = addUnixDay(finalUnixDate, 1);
        
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
        console.log(error);
        next(new handleError('Error al descargar el reporte', "SERVER_ERR"));
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
        const vehicleId = req.params.vehicleId;

        const [ month, year ] = monthAndYear.split('/');
        const monthNormalized = normalizeMonth(month);

        if(monthNormalized >= 13) {
            return next(new handleError("El mes o el año no es válido", "VALIDATION_ERR"));
        }

        const daysInMonth = getDaysInMonth(monthNormalized-1, +year);

        const initialDate = `${year}-${month}-01`;
        const finalDate = `${year}-${month}-${daysInMonth}`;
        const vehicle = await Vehicle.findOne({where:{id:vehicleId}});
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
                    required: true,
                    include: {
                        model:Vehicle,
                        as: 'vehicle',
                        attributes:['id', 'name']
                    },
                    where: {
                        vehicle_id:vehicleId
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

        worksheet.columns = columnsHeaderVehicleExit.map(header => ({
            key: header.key,
            width: header.width
        }));

        worksheet.mergeCells('A1:B6');
        worksheet.mergeCells('C1:E3');
        worksheet.getCell('C1').value = 'UNIVERSIDAD ITECCE';
        worksheet.getCell('C1').alignment = {
            vertical: "middle",
            horizontal: "center"
        }
        worksheet.getCell('C1').font = {
            bold: true,
            size: 16
        }
        worksheet.mergeCells('C4:E6');
        worksheet.getCell('C4').value = `BITACORA DE USO VEHÍCULO\n UTILITARIO`;
        worksheet.getCell('C4').alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true
        }
         worksheet.getCell('C4').font = {
            bold: true,
            size: 16
        }
        worksheet.mergeCells('F1:K1');
        worksheet.getCell('F1').value = {
            richText: [
                {
                    text: 'Código: '
                },
                {
                    text: `${vehicle.code}`,
                    font: {
                        bold: true
                    }
                }
            ]
        }
        worksheet.mergeCells('F2:K2');
        worksheet.getCell('F2').value = `Asunto: Formato`;
        worksheet.mergeCells('F3:K3');
        worksheet.getCell('F3').value = {
            richText: [
                {
                    text: 'Responsable de llenado: '
                },
                {
                    text: `Elemento de seguridad`,
                    font: {
                        bold: true
                    }
                }
            ]
        }
        worksheet.mergeCells('F4:K4');
        worksheet.getCell('F4').value = {
            richText: [
                {
                    text: 'Área que Genera y supervisa: '
                },
                {
                    text: `Coordinación Administrativa`,
                    font: {
                        bold: true
                    }
                }
            ]
        }
        worksheet.getCell('F5').value = `Fecha de `;
        worksheet.getCell('G5').value = `27/11/2019`;
        worksheet.getCell('H5').value = `Fecha de`;
        worksheet.getCell('H5').font = {
            bold:true
        }
        worksheet.mergeCells('I5:K5');
        worksheet.mergeCells('F6:K6');


        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin", color: { argb: "FF000000" } },
                    left: { style: "thin", color: { argb: "FF000000" } },
                    bottom: { style: "thin", color: { argb: "FF000000" } },
                    right: { style: "thin", color: { argb: "FF000000" } }
                };
            });
        });

        worksheet.getCell('A9').value = `UNIDAD ${vehicle.unit}:`;
        worksheet.mergeCells('B9:D9');
        worksheet.getCell('B9').value = vehicle.name.toUpperCase();

        worksheet.getCell('F9').value = 'PLACAS:';
        worksheet.getCell('F9').alignment = {
            horizontal: 'center'
        }
        worksheet.getCell('G9').value = vehicle.license_plate;

        worksheet.getCell('H9').value = 'SERIE:';
        worksheet.getCell('H9').alignment = {
            horizontal: 'center'
        }
        worksheet.getCell('I9').value = vehicle.serie;
        worksheet.getCell('I9').alignment = {
            horizontal: 'center'
        }
        worksheet.getRow(9).font = {
            bold: true,
            size: 15
        }

        const row9 = ['A9','B9','C9','D9','E9','F9','G9','H9','I9','J9','K9','L9','M9'];
        row9.forEach(address => {
            worksheet.getCell(address).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFBDD7EE' }
            };
            worksheet.getCell(address).border = {
                top: { style: "thin", color: { argb: "FFAFAFAF" } },
                left: { style: "thin", color: { argb: "FFAFAFAF" } },
                bottom: { style: "thin", color: { argb: "FFAFAFAF" } },
                right: { style: "thin", color: { argb: "FFAFAFAF" } }
            };
        });

        worksheet.getCell('A10').value = 'REPORTE:';

        const row10 = ['A10','B10','C10','D10','E10','F10','G10','H10','I10','J10','K10','L10','M10'];
        row10.forEach(address => {
            worksheet.getCell(address).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFBDD7EE' }
            };
            worksheet.getCell(address).border = {
                top: { style: "thin", color: { argb: "FFAFAFAF" } },
                left: { style: "thin", color: { argb: "FFAFAFAF" } },
                bottom: { style: "thin", color: { argb: "FFAFAFAF" } },
                right: { style: "thin", color: { argb: "FFAFAFAF" } }
            };
        });
        //Continuar con mostrar el agosto 2025
        worksheet.getCell('B10').value = `${getMonthName(month)} ${year}`;
        worksheet.getCell('B10').font = {
            color: { argb: "FF0033FF" },
        }

        worksheet.mergeCells('F10:H10');
        worksheet.getCell('F10').value = 'VIGENCIA POLIZA SEGURO:';
        worksheet.getRow(10).font = {
            bold: true,
            size: 15
        }
        
        worksheet.getCell('A11').value = 'FECHA';
        worksheet.getCell('B11').value = 'CONDUCTOR';
        worksheet.getCell('C11').value = 'DESTINO';
        worksheet.getCell('D11').value = 'HORA DE SALIDA';
        worksheet.getCell('E11').value = 'KM SALIDA';
        worksheet.getCell('F11').value = 'TANQUE SALIDA';
        worksheet.getCell('G11').value = 'HORA REGRESO';
        worksheet.getCell('H11').value = 'KM REGRESO';
        worksheet.getCell('I11').value = 'TANQUE REGRESO';
        worksheet.getCell('J11').value = 'MOTIVO';
        worksheet.getCell('K11').value = 'TIEMPO FUERA';
        worksheet.getCell('L11').value = 'KM RECORRIDOS';
        worksheet.getCell('M11').value = 'ESTADO';
        worksheet.getRow(11).height = 20;
        worksheet.getRow(11).font = {
            color: { argb: "FFFFFFFF" },
            size: 12
        }
        worksheet.getRow(11).alignment = {
            horizontal: "center",
            vertical: "middle"
        }
        worksheet.getRow(11).eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF000000' }
            }
        });


        checkOuts.forEach(checkOut => {
            let timeOut = '';
            let mileageTraveled = '';

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
                `${checkOut.arrival_time??''}`,
                checkOut.checkOutVehicular.arrival_km??'',
                `${checkOut.checkOutVehicular.input_tank_lavel??''}`,
                `${checkOut.reason??''}`,
                timeOut,
                mileageTraveled,
                `${status[checkOut.status]}`
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
             row.getCell(13).alignment = {
                horizontal: "center",
                vertical: "middle"
            }
        });

        for (let row = 12; row <= worksheet.rowCount; row++) {
            for (let col = 1; col <= 13; col++) { // A:M
                worksheet.getCell(row, col).border = {
                    top: { style: "thin", color: { argb: "FF000000" } },
                    left: { style: "thin", color: { argb: "FF000000" } },
                    bottom: { style: "thin", color: { argb: "FF000000" } },
                    right: { style: "thin", color: { argb: "FF000000" } }
                };
            }
        }

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
        next(new handleError('Error al descargar el reporte', "SERVER_ERR"));
    }
}

module.exports = {
    staffDepartureReport,
    vehicleExitReport
}