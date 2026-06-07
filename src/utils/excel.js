const ExcelJS = require("exceljs");

const createWorkbook = () => {
    return workbook = new ExcelJS.Workbook();
} 

const createWorksheet = (workbook) => {
    return workbook.addWorksheet("Tamplate");
} 

const addHeader = (headers, worksheet, rowHeader = 1) => {
    worksheet.columns = headers.map(header => ({
        header: header.value, 
        key: header.key,
        width: header.width
    }));

    worksheet.getRow(rowHeader).alignment = {
        vertical: "middle",
    };

    worksheet.getRow(rowHeader).eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1A66AC" }
        };
        cell.font = {
            bold: true,
            color: { argb: "FFFFFFFF" },
            size: 12
        };
    });

    return worksheet;
}

const addBorderAndHeight = (worksheet) => {
    return worksheet.eachRow((row) => {
        row.height = 25;
        row.eachCell((cell) => {
            cell.border = {
                top: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "thin", color: { argb: "FF000000" } },
                right: { style: "thin", color: { argb: "FF000000" } }
            };
        });
    });
}

module.exports = {
    createWorkbook,
    createWorksheet,
    addHeader,
    addBorderAndHeight
}