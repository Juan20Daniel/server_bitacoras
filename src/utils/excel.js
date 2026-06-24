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
            fgColor: { argb: "FF000000" }
        };
        cell.font = {
            bold: true,
            color: { argb: "FFFFFFFF" },
            size: 12
        };
    });

    return worksheet;
}

const addBorderAndHeight = (worksheet, height = 25) => {
    return worksheet.eachRow((row) => {
        row.height = height;
        row.eachCell((cell) => {
            cell.border = {
                top: { style: "thin", color: { argb: "FF666666" } },
                left: { style: "thin", color: { argb: "FF666666" } },
                bottom: { style: "thin", color: { argb: "FF666666" } },
                right: { style: "thin", color: { argb: "FF666666" } }
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