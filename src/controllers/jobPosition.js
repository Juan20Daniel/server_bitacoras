const { handleError } = require('../utils/error');
const { normalizeQueryParams } = require('../utils/queryParams');
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { 
    Equipment,
    EquipmentFeatures,
    Department,
    Staff,
    Camp,
    JopPosition,
    JopPositionHistory
} = require('../models');

const jobPositionById = async (id) => {
    return await JopPosition.findOne({
        attributes:['id', 'name', 'active','createdAt','updatedAt'],
        include: [
            {
                model: Department,
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
        where:{id:id}
    });
}

const getJobPositionById = async (req, res, next) => {
    try {
        const { jobPositionId } = req.params;

        const jobPosition = await JopPosition.findOne({
        attributes:['id', 'name', 'active','createdAt','updatedAt'],
        include: [
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
                as: 'staff',
            },
            {
                model: Department,
                attributes: [
                    'id',
                    'name', 
                    'inventory_type', 
                    'createdAt',
                    'active'
                ],
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
        where:{id:jobPositionId}
    });
    
    res.status(200).json({
        message:'Posición de trabajo',
        jopPosition:jobPosition
    });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al optener los puestos de trabajo por departamento'))
    }
}

const getJopPositionsNames = async (req, res, next) => {
    try {
        const jopPositionsNames = await JopPosition.findAll({
            attributes:['id', 'name'],
            where: {active:true}
        });
    
        res.status(200).json({
            message:'Lista de nombres de positiones de trabajo',
            jopPositionsNames
        });
    } catch (error) {
        next(new handleError('Error al obtener la lista nombres de puestos de trabajo', "SERVER_ERR"));
    }
};

const getJobPositionsByDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const page =  normalizeQueryParams(req.query.page);
        const pageSize = 10;
        const jopPositions = await JopPosition.findAll({
        attributes:['id', 'name', 'active','createdAt','updatedAt'],
        include: [
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
                as: 'staff',
                required: false
            },
            {
                model: Department,
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
        limit: pageSize,
        offset: (page - 1) * pageSize,
        where:{
            department_id:departmentId,
            active: true
        }
    });
    
    res.status(200).json({
        message:'Lista de puestos de trabajo por departamento',
        pageSize: pageSize,
        nextPage: page+1,
        jopPositions:jopPositions
    });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al optener los puestos de trabajo por departamento'))
    }
}


const getAssetCustodyForm = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        let whereJobPosition = {}

        if(!req.query.jobPositionId) {
            next(new handleError('El jobPositionId es requerido', "SERVER_ERR"));
        }
        whereJobPosition.id = normalizeQueryParams(req.query.jobPositionId);

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
                    model: JopPosition,
                    attributes: [],
                    as: 'jopPositionfilter',
                    where: whereJobPosition,
                    through: {attributes: []},
                    required: true
                },
                {
                    model: JopPosition,
                    as: 'jopPosition',
                    through: {attributes: []},
                    required: false
                },
                {
                    model:EquipmentFeatures,
                    attributes: ['id', 'description'],
                    as: 'equipmentFeatures'
                },
                {
                    model:Department,
                    attributes: [
                        'id',
                        'name',
                        'inventory_type',
                        'createdAt',
                        'active'
                    ],
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
                inventory_type: 'jop_position',
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

const createJobPosition = async (req, res, next) => {
    try {
        const { jopPositionName, departmentId } = req.body;
        const { id } = await JopPosition.create({
            name:jopPositionName,
            department_id:departmentId
        });

        const newJopPosition = await jobPositionById(id);

        res.status(201).json({
            message:'Puesto de trabajo creado',
            jopPosition:newJopPosition
        });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al crear el puesto de trabajo'));
    }
}

const vacatePosition = async (req, res, next) => {
    try {
        const { jobPositionId } = req.body;

        const jobPosition = await JopPosition.findOne({
            attributes:['id','name'],
            include: [
                {
                    model:Staff,
                    as:'staff',
                    attributes:[
                        'id',
                        'firstname',
                        'lastname',
                        'email',
                        'folio'
                    ]
                },
                {
                    model: Equipment,
                    as:'equipment',
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
                        'inventory_type'
                    ],
                    through: {attributes:[]},
                    include:[
                        {
                            model:EquipmentFeatures,
                            attributes: ['id', 'description'],
                            as: 'equipmentFeatures'
                        },
                    ],
                    where: {active:true},
                }
            ],
            where:{id:jobPositionId}
        });

        

        const result = await sequelizeConfig.transaction(async (transaction) => {
            const resJopPositionHistory = await JopPositionHistory.create(
                {
                    firstname:jobPosition.staff.firstname,
                    lastname:jobPosition.staff.lastname,
                    email:jobPosition.staff.email,
                    folio:jobPosition.staff.folio,
                    jop_position_id:jobPositionId
                },
                {transaction}
            );
            const equipmentHistoryData = jobPosition.equipment.map(equip => ({
                image:equip.image,
                own:equip.own,
                fixed_asset_type:equip.fixed_asset_type, 
                clasification:equip.clasification,
                brand:equip.brand,
                model:equip.model,
                state:equip.state,
                folio:equip.folio,
                quantity:equip.quantity,
                observations:equip.observations,
                inventory_type:equip.inventory_type,
                jop_position_history_id:resJopPositionHistory.id
            }));

            console.log(equipmentHistoryData);
        });

        res.status(201).json({
            message:'Resucupar puesto de trabajo',
            // jobPosition:jobPosition
        });
        //Continuar guardando el puesto en el hitorial
    } catch (error) {
        console.log(error);
        next(new handleError('Error al desocupar el puesto'));
    }
}

module.exports = {
    getJopPositionsNames,
    getJobPositionById,
    getJobPositionsByDepartment,
    getAssetCustodyForm,
    createJobPosition,
    vacatePosition,
}