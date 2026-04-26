const { Equipment, EquipmentFeatures, StaffEquipment, Staff } = require('../models');
const { handleError } = require("../utils/error");
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { moveImg, removeImg } = require('../utils/file');
const { normalizeQueryParams } = require('../utils/queryParams');

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
    const lastEquipment = await Equipment.findOne({
        attributes:['folio'],
        order:[['id', 'DESC']]
    });
    if(!lastEquipment) {
        return 'E-001';
    }
    
    const numfolio = normalizeNumFolio(lastEquipment.folio)+1;

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
            'observations'
        ],
        include: [
            {
                model:Staff,
                attributes: ['id', 'firstname', 'lastname']
            },
            {
                model:EquipmentFeatures,
                attributes: ['id', 'description'],
                as: 'equipmentFeatures'
            }
        ],
        where:{id:id}
    });

    return equipment;
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
            observations
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
                    department_id:departmentId
                },
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
            console.log(inChargeNormalized)
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
            message: 'Equipo agregado',
            equipment: newEquipment
        });
    } catch (error) {
        console.log(error);
        if(req.file) await removeImg(req.file.filename);
        next(new handleError('Error al agregar el equipo'));
    }
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
                'observations'
            ],
            include: [
                {
                    model:Staff,
                    attributes: ['id', 'firstname', 'lastname']
                },
                {
                    model:EquipmentFeatures,
                    attributes: ['id', 'description'],
                    as: 'equipmentFeatures'
                }
            ],
            limit: pageSize,
            offset: (page - 1) * pageSize,
            where: {
                department_id:departmentId
            }
        });
        
        res.status(201).json({
            message: 'Lista de equipos',
            nextPage: page+1,
            equipments: equipments,
        });
    } catch (error) {
        next(new handleError('Error al obtener los equipos'));
    }
}

module.exports = {
    addEquipment,
    equipmentsByDepartment
}