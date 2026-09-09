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
    addBorderAndHeight
} = require('../utils/excel');

const {
    fromStringDateToUnixDate,
    fromUnixDateToDateFormat,
    addUnixDay
} = require('../utils/time');

const columnsHeader = [
    { value: "CODIGO", key: "code", width: 10 },
    { value: "PRODUCTO", key: "product", width: 30 },
    { value: "UNIDAD", key: "unit", width: 10 },
    { value: "", key: "initStock", width: 20 },
    { value: "ENTRADAS", key: "inputs", width: 10 },
    { value: "SALIDAS", key: "outputs", width: 10 },
    { value: "", key: "finalStock", width: 20 }
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

        const department = await Department.findOne({
            attributes:['id', 'name'],
            where:{id:departmentId}
        });

        const formatInitialDate = fromUnixDateToDateFormat(initialUnixDate);
        const formatFinalDate = fromUnixDateToDateFormat(finalUnixDate);

        const articles = await Article.findAll({
            attributes:['id','name','unit','code','quantity'],
            include: [
                {
                    model: ArticleEntryHistory,
                    attributes:[
                        'id',
                        'quantity',
                        'createdAt'
                    ],
                    required:false,
                    as: 'articleEntryHistory',
                    where: {
                        createdAt: {
                            [Op.between]: [
                                `${formatInitialDate}T06:00:00.000Z`,
                                `${formatFinalDate}T06:00:00.000Z`
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
                                `${formatInitialDate}T06:00:00.000Z`,
                                `${formatFinalDate}T06:00:00.000Z`
                            ]
                        }
                    }
                }
            ],
            where: {
                department_id:departmentId,
                active:true
            }
        });

        if(articles.length <= 0) {
            return next(new handleError("No se encontro material para generar el reporte", "NOT_FOUND_ERR"));
        }

        const history = await Article.findAll({
            attributes: ['id','code','quantity'],
            include: [
                {
                    model: ArticleEntryHistory,
                    attributes: [
                        'id',
                        'quantity',
                        'createdAt'
                    ],
                    required:false,
                    as: 'articleEntryHistory',
                    where: {
                        createdAt: {
                            [Op.lt]: `${formatInitialDate}T06:00:00.000Z`,
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
                            [Op.lt]: `${formatInitialDate}T06:00:00.000Z`,
                        }
                    }
                }
            ],
            
            where: {
                department_id:departmentId,
                active:true
            }
        });

        const quantityHistory = history.map(historyItem => {
            const { articleEntryHistory, articleOutputHistory } = historyItem;
            if(!articleEntryHistory.length && !articleOutputHistory.length) {
                return {
                    articleId: historyItem.id,
                    articleCode: historyItem.code,
                    inputsQuantity: 0,
                    outputQuantity: 0,
                }
            }

            const inputsQuantity = articleEntryHistory.reduce((preValue, currentValue) => {
                return preValue+currentValue.quantity;
            },0);

            const outputQuantity = articleOutputHistory.reduce((preValue, currentValue) => {
                return preValue+currentValue.quantity;
            },0);

            return {
                articleId: historyItem.id,
                articleCode: historyItem.code,
                inputsQuantity: inputsQuantity,
                outputQuantity: outputQuantity,
            }
        });
        
        const initialStockByArticle = quantityHistory.map(historyItem => {
            const quantity = historyItem.inputsQuantity - historyItem.outputQuantity
            return {
                articleId: historyItem.articleId,
                articleCode: historyItem.articleCode,
                quantity: quantity
            }
        });

        const inputsQuantityByArticle = articles.map(article => {
            if(!article.articleEntryHistory.length) {
                return {
                    articleId: article.id,
                    articleCode: article.code,
                    quantity: 0
                }
            }
        
            const quantity = article.articleEntryHistory.reduce((preValue, currentValue) => {
                return preValue+currentValue.quantity;
            }, 0);

            return {
                articleId: article.id,
                articleCode: article.code,
                quantity: quantity
            }
        });

        const outputsQuantityByArticle = articles.map(article => {
            if(!article.articleOutputHistory.length) {
                return {
                    articleId: article.id,
                    articleCode: article.code,
                    quantity: 0
                }
            }
        
            const quantity = article.articleOutputHistory.reduce((preValue, currentValue) => {
                return preValue+currentValue.quantity;
            }, 0);

            return {
                articleId: article.id,
                articleCode: article.code,
                quantity: quantity
            }
        });

        const quantitiesResultByArticle = initialStockByArticle.map(historyInput => {
            const historyQuantity = historyInput.quantity;

            const inputs = inputsQuantityByArticle.find(v => v.articleId === historyInput.articleId);
            
            const inputsQuantity = inputs.quantity;
            
            const outputs = outputsQuantityByArticle.find(v => v.articleId === historyInput.articleId);
           
            const outputsQuantity = outputs.quantity;

            const finalQuantity = (historyQuantity + inputsQuantity) - outputsQuantity;

            return {
                articleId: historyInput.articleId,
                articleCode: historyInput.articleCode,
                initialStock: historyQuantity,
                inputs: inputsQuantity,
                outputs: outputsQuantity,
                finalStock:finalQuantity
            }
        });

        const workbook = createWorkbook();
        
        const worksheet = createWorksheet(workbook);

        worksheet.mergeCells(1, 1, 1,7);

        worksheet.getCell('A1').value = `INVENTARIO DE PRODUCTOS DE ${department.name.toUpperCase()}`;

        worksheet.getCell('A1').alignment = {
            horizontal: 'center',
            vertical: 'middle'
        };

        worksheet.getCell('A1').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD2D2D2" }
        }

        worksheet.getCell('A1').font = {
            bold: true,
            color: { argb: "00000000" },
            size: 12
        };

        worksheet.columns = columnsHeader.map(header => ({
            key: header.key, 
            width: header.width
        }));

        worksheet.addRow(columnsHeader.map(header => header.value));

        worksheet.getRow(2).alignment = {
            vertical: "middle",
        };

        worksheet.getRow(2).eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "00000000" }
            };
            cell.font = {
                bold: false,
                color: { argb: "FFFFFFFF" },
                size: 10
            };
        });

        worksheet.getRow(2).getCell(4).value = `STOCK AL ${initialDate}`
        worksheet.getRow(2).getCell(7).value = `STOCK AL ${finalDate}`
        //Generar las filas
        articles.forEach(article => {
            const quantities = quantitiesResultByArticle.find(item => item.articleId === article.id);

            const row = worksheet.addRow([
                +article.code,
                `${article.name}`,
                `${article.unit}`,
                quantities.initialStock,
                quantities.inputs,
                quantities.outputs,
                quantities.finalStock,
            ]);
            
            row.alignment = {
                horizontal: "center",
                vertical: "middle"
            }
            row.getCell(2).alignment = {
                vertical: "middle",
            }
        });

        addBorderAndHeight(worksheet, 18);

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
        next(new handleError('Error al descargar el reporte de material de papeleria', "SERVER_ERR"));
    }
}

const getDepartments = async (req, res, next) => {
    try {
        const {campId} = req.query;
        const where = {};
        if(req.query.active) {
            where.active = req.query.active === 'true'
                ? true
                : false
        }
        if(campId) {
            where.camps_id = campId;
        }
        const deparments = await Department.findAll({
            attributes: ['id','name','inventory_type','active'],
            include: [
                {
                    model: Camp,
                    as:'camp',
                    attributes: [
                        'id', 
                        'city', 
                        'school_type', 
                        'active'
                    ]
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
       
        const department = await Department.findOne({
            attributes: ['id','name','inventory_type', 'active'],
            include: [
                {
                    model: Camp,
                    as: 'camp',
                    attributes: ['id','city','school_type', 'active']
                }
            ],
            where:{ id:departmentId }
        });

        res.status(200).json({message:'Departamento', department});

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
                        'title'
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

const createDepartment = async (req, res, next) => {
    try {
        const { departmentName, campId, departmentInventoryType } = req.body;
        
        const newDepartment = await Department.create({
            name: departmentName,
            camps_id: campId,
            inventory_type: departmentInventoryType,
        });

        const department = await Department.findOne({
            attributes: ['id','name','inventory_type', 'active'],
            include: [
                {
                    model: Camp,
                    as: 'camp',
                    attributes: ['id','city','school_type', 'active']
                }
            ],
            where:{ id:newDepartment.id }
        });

        res.status(201).json({
            message: 'Departamento creado',
            department: department
        });
    } catch (error) {
        next(new handleError('Error al crear el departamento', "SERVER_ERR"));
    }
}

const updateDepartment = async (req, res, next) => {
     try {
        const { departmentId } = req.params;
        const { departmentName, campId, departmentInventoryType } = req.body;

        await Department.update(
            {
                name: departmentName,
                camps_id: campId,
                inventory_type: departmentInventoryType
            },
            {where:{ id:departmentId }}
        );

        const department = await Department.findOne({
            attributes: ['id','name','inventory_type', 'active'],
            include: [
                {
                    model: Camp,
                    as: 'camp',
                    attributes: ['id','city','school_type', 'active']
                }
            ],
            where:{ id:departmentId }
        });

        res.status(201).json({
            message: 'Departamento modificado',
            department: department
        });
    } catch (error) {
        next(new handleError('Error al modificar el departamento', "SERVER_ERR"));
    }
}


const toggleDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        
        const disable = req.body.disable === 'true' 
            ? false 
            : true
       
        await Department.update(
            {active:disable},
            {where:{id:departmentId}}
        );

        res.status(201).json({message:`Departamento ${disable ? 'inavilitado' : 'habilitado'}`});
    } catch (error) {
        console.log(error);
        next(new handleError(`Error al ${disable ? 'inavilitado' : 'habilitado'} el departamento`, "SERVER_ERR"));
    }
}

module.exports = {
    getDepartments,
    getDepartmentHistory,
    getDepartmentById,
    getAssetCustodyForm,
    variableDepartmentReport,
    createDepartment,
    updateDepartment,
    toggleDepartment
}