const { Op } = require('sequelize');
const { 
    Camp,
    Department,
    Equipment,
    Staff,
    EquipmentFeatures,
    EquipmentHistory,
    ArticleEntryHistory,
    ArticleOutputHistory,
    Article
} = require('../models');
const { handleError } = require('../utils/error');
const { normalizeQueryParams } = require('../utils/queryParams');
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
    getDaysInMonth,
    removeHours,
    addUnixDay
} = require('../utils/time');

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

const columnsHeader = [
    { value: "CODIGO", key: "code", width: 10 },
    { value: "PRODUCTO", key: "product", width: 30 },
    { value: "UNIDAD", key: "unit", width: 10 },
    { value: "STOCK AL", key: "initStock", width: 15 },
    { value: "ENTRADAS", key: "inputs", width: 10 },
    { value: "SALIDAS", key: "outputs", width: 10 },
    { value: "STOCK AL", key: "finalStock", width: 15 }
];

const variableDepartmentReport = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const { initialDate, finalDate } = req.query;
        
        let initialUnixDate = fromStringDateToUnixDate(initialDate);
        let finalUnixDate = fromStringDateToUnixDate(finalDate);

        if(initialUnixDate > finalUnixDate) {
            return next(new handleError("Rango de fecha invalido", "RANGE_ERR"));
        }
        
        finalUnixDate = addUnixDay(finalUnixDate, 1);
        
        const articles = await Article.findAll({
            attributes:['id','name','unit','code','quantity'],
            include: [
                {
                    model: ArticleEntryHistory,
                    attributes:[
                        'id',
                        'quantity',
                        'createdAt',
                        'bill'
                    ],
                    required:false,
                    as: 'articleEntryHistory',
                    where: {
                        createdAt: {
                            [Op.between]: [
                                `${fromUnixDateToDateFormat(initialUnixDate)}T06:00:00.000Z`,
                                `${fromUnixDateToDateFormat(finalUnixDate)}T06:00:00.000Z`
                            ]
                        }
                    }
                },
                {
                    model: ArticleOutputHistory,
                    attributes: [
                        'id',
                        'quantity',
                        'createdAt',
                    ],
                    as: 'articleOutputHistory',
                    required:false,
                    where: {
                        createdAt: {
                            [Op.between]: [
                                `${fromUnixDateToDateFormat(initialUnixDate)}T06:00:00.000Z`,
                                `${fromUnixDateToDateFormat(finalUnixDate)}T06:00:00.000Z`
                            ]
                        }
                    }
                }
            ],
            where:{ 
                department_id:departmentId,
                active:true
            }
        });

        if(articles.length <= 0) {
            return next(new handleError("No se encontraro material para generar el reporte", "NOT_FOUND_ERR"));
        }

        const workbook = createWorkbook();
        
        const worksheet = createWorksheet(workbook);

        addHeader(columnsHeader, worksheet);

        //Centrar horiozontal y verticalmente el campo Estado.
        // worksheet.getRow(1).getCell(8).alignment = {
        //     horizontal: "center",
        //     vertical: "middle"
        // };

        //Generar las filas
        // checkOuts.forEach(checkOut => {
        //     const selfieName = checkOut.selfie_img??'';
        //     const selfieUrl = selfieName !== '' ? `${BASE_SELFIE_URL}/${checkOut.selfie_img}` : null;
        //     const selfieLink = selfieUrl
        //         ?   {
        //                 text:'Ver selfie',
        //                 hyperlink:`${selfieUrl}`
        //             }
        //         :   ''
        //     const startDate = fromDbDateToNormalDate(checkOut.start_date);
        //     const row = worksheet.addRow([
        //         selfieLink,
        //         `${checkOut['staff.firstname']}`,
        //         `${checkOut['staff.lastname']}`,
        //         `${startDate}`,
        //         `${checkOut.departure_time??''}`,
        //         `${checkOut.arrival_time??''}`,
        //         `${checkOut.reason}`,
        //         `${status[checkOut.status]}`
        //     ]);
            
        //     row.alignment = {
        //         vertical: "middle",
        //     }
        //     const selfieCell = row.getCell(1);
        //     selfieCell.font = {
        //         color: { argb: "FF1A66AC" },
        //         underline: true
        //     }

        //     const statusStyle = styles[checkOut.status];

        //     const statusCell = row.getCell(8);

        //     statusCell.fill = {
        //         type: "pattern",
        //         pattern: "solid",
        //         fgColor: { argb: statusStyle.fill }
        //     };

        //     statusCell.font = {
        //         color: { argb: statusStyle.font },
        //         bold: true
        //     };

        //     statusCell.alignment = { 
        //         horizontal: "center", 
        //         vertical: "middle", 
        //     };
        // })

        // addBorderAndHeight(worksheet);

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

        // res.status(200).json({
        //     message:'Reporte de material de papeleria',
        //     articles
        // })
    } catch (error) {
        console.log(error);
        next(new handleError('Error al descargar el reporte de material de papeleria', "SERVER_ERR"));
    }
}

const getDepartmentByCampus = async (req, res, next) => {
    try {
        const {campId} = req.query;
        const where = {}
        if(campId) {
            where.camps_id = campId;
        }
        const deparments = await Department.findAll({
            attributes: ['id','name'],
            include: [
                {
                    model: Camp,
                    as:'camp',
                    attributes: ['id', 'city', 'school_type']
                }
            ],
            where
        });

        res.status(200).json({message:'Lista de departamentos', deparments});

    } catch (error) {
        next(new handleError('Error al listar los departamentos', "SERVER_ERR"));
    }
};

const getDepartmentById = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
       
        const deparment = await Department.findOne({
            attributes: ['id','name','inventory_type'],
            include: [
                {
                    model:Camp,
                    as:'camp',
                    attributes: ['id','city','school_type']
                }
            ],
            where:{ id:departmentId }
        });

        res.status(200).json({message:'Departamento', deparment});

    } catch (error) {
        next(new handleError('Error al obtener el departamento', "SERVER_ERR"));
    }
};

const getDepartmentHistory = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const page = normalizeQueryParams(req.query.page);
        const initialDate = req.query.initialDate;
        const finalDate = req.query.finalDate;

        
        if((initialDate && !finalDate) || (!initialDate && finalDate)) {
            return next(new handleError('Rango de fechas invalido', "VALIDATION_ERR"));
        }

        const where = {
            department_id:departmentId,
            inventory_type: "department"
        };

        if(initialDate && finalDate) {
            const initialUnixDate = fromStringDateToUnixDate(initialDate);
            const finalUnixDate = fromStringDateToUnixDate(finalDate);

            if(initialUnixDate > finalUnixDate) {
                return next(new handleError("Rango de fecha invalido", "RANGE_ERR"));
            }
           
            where.createdAt = {
                [Op.between]:[
                    fromUnixDateToDateFormat(initialUnixDate),
                    fromUnixDateToDateFormat(finalUnixDate)
                ]
            }
        }
        
        const pageSize = 20;
        const equipments = await Equipment.findAll({
            attributes: [
                'id',
                'image',
                'own',
                'fixed_asset_type',
                'clasification',
                'brand',
                'model',
                'state',
                'folio',
                'quantity',
                'observations',
                'createdAt',
                'active'
            ],
            include: [
                {
                    model:EquipmentHistory,
                    attributes: [
                        'id',
                        'createdAt',
                    ],
                    as: 'equipmentHistory',
                },
                {
                    model:Staff,
                    attributes: [
                        'id', 
                        'firstname', 
                        'lastname',
                        'email', 
                        'active', 
                        'role', 
                        'folio',
                        'title'
                    ],
                    as:'staff'
                },
                {
                    model:EquipmentFeatures,
                    attributes: ['id', 'description'],
                    as: 'equipmentFeatures'
                },
                {
                    model:Department,
                    attributes: ['id','name', 'inventory_type', 'createdAt', 'active'],
                    include: [
                        {
                            model:Camp,
                            attributes:['id', 'city', 'school_type', 'active'],
                            as:'camp'
                        }
                    ],
                    as:'department',
                }
            ],
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: (page - 1) * pageSize,
            where: where,
        });

        res.status(200).json({
            message: 'Historial del departamento',
            pageSize: pageSize,
            nextPage: page+1,
            equipments: equipments
        });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al obtener el historial del departamento', "SERVER_ERR"));
    }
}

const getAssetCustodyForm = async (req, res, next) => {
    try {
        const { departmentId, employeeId } = req.params;

        const equipments = await Equipment.findAll({
            attributes: [
                'id',
                'image',
                'own',
                'fixed_asset_type',
                'clasification',
                'brand',
                'model',
                'state',
                'folio',
                'quantity',
                'observations',
                'createdAt',
                'active',
            ],
            include: [
                {
                    model: Staff,
                    as: 'staffFilter',
                    attributes: [],
                    through: {
                        attributes: []
                    },
                    where: {id:employeeId},
                    required: true
                },
                {
                    model: Staff,
                    attributes: [
                        'id',
                        'firstname',
                        'lastname',
                        'email',
                        'active',
                        'role', 
                        'folio',
                        'title',
                    ],
                    through: {
                        attributes:[]
                    },
                    as: 'staff',
                },
                {
                    model:EquipmentFeatures,
                    attributes: ['id', 'description'],
                    as: 'equipmentFeatures'
                },
                {
                    model:Department,
                    attributes: ['id','name', 'inventory_type', 'createdAt', 'active'],
                    include: [
                        {
                        model:Camp,
                        attributes:['id', 'city', 'school_type', 'active'],
                        as:'camp'
                        }
                    ],
                    as:'department'
                }
            ],
            where: {
                inventory_type: 'department',
                department_id: departmentId,
                active: true
            }
        });
    
        res.status(201).json({
            message: 'Lista de equipos',
            equipments: equipments,
        });
    } catch (error) {
        next(new handleError('Error al obtener los equipos', "SERVER_ERR"));
    }
}



const createDepartment = (req, res, next) => {
    try {
        
    } catch (error) {
        next(new handleError('Error al crear el departamento', "SERVER_ERR"));
    }
}

module.exports = {
    getDepartmentByCampus,
    getDepartmentHistory,
    getDepartmentById,
    getAssetCustodyForm,
    variableDepartmentReport,
    createDepartment
}