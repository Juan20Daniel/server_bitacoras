const { Equipment, EquipmentFeatures, StaffEquipment, Staff, EquipmentHistory, Department, Camp } = require('../models');
const { handleError } = require("../utils/error");
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { moveImg, removeImg } = require('../utils/file');
const { normalizeQueryParams } = require('../utils/queryParams');
const { Op } = require('sequelize');

const normalizeNumFolio = (folio) => {
    let numFolio = folio.replace('E-','');
    if(numFolio.startsWith('00') || numFolio.startsWith('0')) {
        return parseInt(numFolio.replace(/^0+/,''), 10);
    }
    return parseInt(numFolio, 10);
}

const normalizeFeatures = (features, equipmentID) => { 
    if(!features) return [];

    const featuresArray = features.split(',');
    return featuresArray.map(feature => {
        return {description:feature, equipment_id:equipmentID}
    });
}

const normalizeInCharge = (inCharge, equipmentID) => {
    const inChargeArray = inCharge.split(',');
    return inChargeArray.map(inCharge => {
        return {equipment_id:equipmentID, staff_id:parseInt(inCharge, 10)}
    });
}

const createFolio = async () => {
    const lastEquipmentFolio = await Equipment.findOne({
        attributes:['folio'],
        order:[['id', 'DESC']]
    });
    if(!lastEquipmentFolio) {
        return 'E-001';
    }
    
    const numfolio = normalizeNumFolio(lastEquipmentFolio.folio)+1;

    if(numfolio <= 9) {
        return `E-00${numfolio}`;
    }
    if(numfolio >= 10 && numfolio <= 99) {
        return `E-0${numfolio}`;
    }
    return `E-${numfolio}`;
}

const getEquipmentById = async (id) => {
    const equipment = await Equipment.findOne({
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
                as:'department'
            }
        ],
        where:{
            id:id,
            active:true
        }
    });

    return equipment;
}


const equipmentsByDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const page =  normalizeQueryParams(req.query.page);
        const pageSize = 10;

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
                    as: 'staff'
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
            limit: pageSize,
            offset: (page - 1) * pageSize,
            where: {
                department_id:departmentId,
                inventory_type:'department',
                active:true
            }
        });
        
        res.status(201).json({
            message: 'Lista de equipos',
            pageSize: pageSize,
            nextPage: page+1,
            equipments: equipments,
        });
    } catch (error) {
        next(new handleError('Error al obtener los equipos', "SERVER_ERR"));
    }
}


const equipmentsByEmployee = async (req, res, next) => {
    try {
        const { employeeId } = req.params;
        const page =  normalizeQueryParams(req.query.page);
        const pageSize = 10;

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
                    model:Staff,
                    attributes: ['id', 'firstname', 'lastname','email', 'active', 'role', 'folio'],
                    as: 'staff',
                    where: {id:employeeId}
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
            limit: pageSize,
            offset: (page - 1) * pageSize,
            where: {
                inventory_type:'employee',
                active:true
            }
        });
        
        res.status(201).json({
            message: 'Lista de equipos',
            pageSize: pageSize,
            nextPage: page+1,
            equipments: equipments,
        });
    } catch (error) {
        next(new handleError('Error al obtener los equipos', "SERVER_ERR"));
    }
}

const addEquipment = async (req, res, next) => {
    try {
        const {
            own,
            fixedAssetType,
            clasification,
            brand,
            model,
            state,
            departmentId,
            quantity,
            inCharge,
            features,
            observations,
            inventoryType
        } = req.body;
        let image = null;
        if(req.file) {
            image = req.file.filename;
        }
        const folio = await createFolio();
        const result = await sequelizeConfig.transaction( async (transaction) => {
            const equipmentAdded = await Equipment.create(
                {
                    image:image,
                    own:own,
                    fixed_asset_type:fixedAssetType,
                    clasification:clasification,
                    brand:brand,
                    model:model,
                    state:state,
                    folio:folio,
                    quantity:quantity,
                    observations:observations,
                    department_id:departmentId,
                    inventory_type:inventoryType
                },
                {transaction}
            );

            await EquipmentHistory.create(
                {equipment_id:equipmentAdded.id},
                {transaction}
            );

            const featuresNormalized = normalizeFeatures(features, equipmentAdded.id);
           
            if(featuresNormalized.lenght !== 0) {
                await EquipmentFeatures.bulkCreate(
                    featuresNormalized,
                    {transaction}
                );
            }
            
            const inChargeNormalized = normalizeInCharge(inCharge, equipmentAdded.id);
            
            await StaffEquipment.bulkCreate(
                inChargeNormalized,
                {transaction}
            );
            return equipmentAdded;
        });
       
        if(req.file) {
            await moveImg(req.file, req.uploadFolder);
        }
        const newEquipment = await getEquipmentById(result.id);

        res.status(201).json({
            message: 'Equipo agregado.',
            equipment: newEquipment
        });
    } catch (error) {
        console.log(error);
        if(req.file) await removeImg(req.file.filename);
        next(new handleError('Error al agregar el equipo', "SERVER_ERR"));
    }
}

const processUpdateInCharges = (inCharge, currentEquipment) => {
    if(!inCharge) return {
        newInCharges:[],
        inChargesToRemove:[]
    }
    const inChargesId = inCharge.split(',')
    const currentInCharges = currentEquipment.staff;

    const newInCharges = [];
    const inChargesToRemove = [];

    inChargesId.forEach(inChargeId => {
        inChargeId = Number(inChargeId);
        const exists = currentInCharges.find(inCharge => {
            return inCharge.id === inChargeId;
        });
        if(!exists) {
            newInCharges.push({equipment_id:currentEquipment.id, staff_id:inChargeId});
        }
    });

    currentInCharges.forEach(inCharge => {
        const exists = inChargesId.find(inChargeId => {
            return Number(inChargeId) === inCharge.id;
        });
        if(!exists) {
            inChargesToRemove.push(inCharge.staffEquipment.id);
        }
    });

    return {
        newInCharges,
        inChargesToRemove
    }
}

const processUpdateFeatures = (features, currentEquipment) => {
    if(!features) {
        return {
            newFeatures:[],
            featuresToRemove:currentEquipment.equipmentFeatures.map(feature => {
                return feature.id;
            })
        }
    }
   
    const newFeatures = [];
    const featuresToRemove = [];

    features = features.split(',');
    const currentFeatures = currentEquipment.equipmentFeatures;
    
    features.forEach(feature => {
        const exists = currentFeatures.find(currentFeature => {
            return currentFeature.description.trim() === feature.trim();
        });
        if(!exists) {
            newFeatures.push({description:feature.trim(), equipment_id:currentEquipment.id});
        }
    });

    currentFeatures.forEach(currentFeature => {
        const exists = features.find(feature => {
            return feature.trim() === currentFeature.description.trim();
        });
        if(!exists) {
            featuresToRemove.push(currentFeature.id);
        }
    });
    
    return {
        newFeatures,
        featuresToRemove
    }
}

const edithEquipment = async (req, res, next) => {
    try {
        if(!req.body) {
            return res.status(201).json({
                message: 'No hay datos para editar.'
            });
        }
        const { equipmentId } = req.params;
        const data = {
            own: req.body.own??false,
            fixed_asset_type: req.body.fixedAssetType??false,
            clasification: req.body.clasification??false,
            brand: req.body.brand??false,
            model: req.body.model??false,
            state: req.body.state??false,
            quantity: req.body.quantity??false
        }
        for(const field in data) {
            if(!data[field]) delete data[field];
        }
        
        const currentEquipment = await getEquipmentById(equipmentId);
        
        if('observations' in req.body && req.body.observations !== currentEquipment.observations) {
            data.observations = req.body.observations === '' ? null : req.body.observations;
        }
        
        if(!currentEquipment) {
            if(req.file) await removeImg(req.file.filename);
            next(new handleError('Equipo no encontrado.', "NOT_FOUND_ERR"));
        }
        if(currentEquipment.image && req.body.removeImage === 'true') {
            await removeImg(currentEquipment.image, 'public/images/equipment/');
        } 
        if(req.file) {
            data.image = req.file.filename;
        }
        if(!req.file && req.body.removeImage === 'true') {
            data.image = null;
        } 
        await sequelizeConfig.transaction(async (transaction) => {

            await Equipment.update(
                data,
                {
                    where:{id:currentEquipment.id},
                    transaction
                }
            );

            const {newInCharges, inChargesToRemove} = processUpdateInCharges(req.body.inCharge, currentEquipment);
       
            if(inChargesToRemove.length) {
                await StaffEquipment.destroy(
                    {where:{id:inChargesToRemove}},
                    {transaction}
                );
            }

            if(newInCharges.length) {
                await StaffEquipment.bulkCreate(
                    newInCharges,
                    {transaction}
                );
            }
        
            const {newFeatures, featuresToRemove} = processUpdateFeatures(req.body.features, currentEquipment);
        
            if(featuresToRemove.length) {
                await EquipmentFeatures.destroy(
                    {where:{id:featuresToRemove}},
                    {transaction}
                );
            }

            if(newFeatures.length) {
                await EquipmentFeatures.bulkCreate(
                    newFeatures,
                    {transaction}
                );
            }
        });

        if(req.file) {
            await moveImg(req.file, req.uploadFolder);
        }

        const equipmentUpdated = await getEquipmentById(equipmentId);

        res.status(201).json({
            message: 'Equipo editado.',
            equipment:equipmentUpdated
        });
    } catch (error) {
        if(req.file) await removeImg(req.file.filename);
        next(new handleError('Error al editar el equipo', "SERVER_ERR"));
    }
}

const inactiveEquipment = async (req, res, next) => {
    try {
        const { equipmentId } = req.params;
        
        await Equipment.update(
            {active:false},
            {where:{id:equipmentId}}
        );

        res.status(201).json({
            message: 'Equipo inactivado',
        });
    } catch (error) {
        next(new handleError('Error al inctivar el equipo', "SERVER_ERR"));
    }
}

const searchEquipment = async (req, res, next) => {
    try {
        const { searchBy, query } = req.query;
        const attributes = [
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
        ];
        const include = [
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
                        attributes:[
                            'id',
                            'city',
                            'school_type',
                            'active'
                        ],
                        as:'camp'
                    }
                ],
                as:'department'
            }
        ]
        if(searchBy==='folio') {
            const equipment = await Equipment.findOne({
                attributes: attributes,
                include:include,
                where:{folio:query}
            });
    
            return res.status(200).json({
                message:'Resultados de la busqueda de equipo por folio',
                equipments:[equipment]
            });
        }

        const equipments = await Equipment.findAll({
            attributes:attributes,
            include: include,
            where:{fixed_asset_type: {
                [Op.like]:`%${query}%`
            }}
        });

        res.status(200).json({
            message:'Resultados de la busqueda de equipo por nombre',
            equipments:equipments??[]
        });

    } catch (error) {
        next(new handleError('Error al buscar el equipo', "SERVER_ERR"));
    }
}

module.exports = {
    addEquipment,
    equipmentsByDepartment,
    equipmentsByEmployee,
    edithEquipment,
    inactiveEquipment,
    searchEquipment
}