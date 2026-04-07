const { CheckOut, Staff } = require('../models');
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");
const { handleError } = require("../utils/error");

const status = {
    'initiated':'Iniciada',
    'canceled':'Cancelada',
    'incomplete':'Incompleta',
    'finalized':'Completo'
}

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

const staffDepartureReport = async (req, res, next) => {
    try {
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
                    [Op.ne]: null
                }
            }
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Reporte");

        worksheet.columns = [
            { header: "Nombre", key: "nombre", width: 20 },
            { header: "Apellidos", key: "email", width: 20 },
            { header: "Fecha", key: "estado", width: 15 },
            { header: "Hora de salida", key: "estado", width: 20 },
            { header: "Hora de llegada", key: "estado", width: 20 },
            { header: "Motivo", key: "estado", width: 30 },
            { header: "Estado", key: "estado", width: 20 },
        ];

        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        worksheet.getRow(1).height = 25;
        worksheet.getRow(1).font = {
            size:15
        };

        worksheet.getRow(1).eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF1A66AC" }
            };
            cell.font = {
                bold: true,
                color: { argb: "FFFFFFFF" },
                size: 14
            };
            cell.border = {
                top: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "thin", color: { argb: "FF000000" } },
                right: { style: "thin", color: { argb: "FF000000" } }
            };
        });

        worksheet.getRow(1).alignment = {
            vertical: "middle",
        };

        worksheet.getRow(1).getCell(7).alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        // console.log(checkOut);
        checkOut.forEach(checkOut => {
            const row = worksheet.addRow([
                `${checkOut.staff.firstname}`,
                `${checkOut.staff.lastname}`,
                `${checkOut.start_date}`,
                `${checkOut.departure_time??''}`,
                `${checkOut.arrival_time??''}`,
                `${checkOut.reason}`,
                `${status[checkOut.status]}`
            ]);
            row.height = 25;
            row.alignment = { vertical: "middle" };
            const style = styles[checkOut.status];
            
            const statusCell = row.getCell(7);
            statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: style.fill }
            };

            statusCell.font = {
                color: { argb: style.font },
                bold: true
            };

            statusCell.alignment = { horizontal: "center", vertical: "middle", };
            
        })

        //Agregar borde a todas las celdas
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

const vehicleExitReport = (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
}

module.exports = {
    staffDepartureReport,
    vehicleExitReport
}