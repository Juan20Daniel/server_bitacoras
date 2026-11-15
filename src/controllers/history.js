const { handleError } = require('../utils/error');
const { normalizeQueryParams } = require('../utils/queryParams');

const {
    JopPositionHistory,
    EquipmentHistory,
    EquipmentHistoryFeatures
} = require('../models');

const getHistory = async (req, res, next) => {
    try {
        const { jobPositionId } = req.params;
        const page =  normalizeQueryParams(req.query.page);
        const pageSize = 5;

        const history = await JopPositionHistory.findAll({
            attributes:[
                'id',
                'firstname',
                'lastname',
                'email',
                'folio',
                'createdAt',
                'updatedAt'
            ],
            where: {jop_position_id:jobPositionId},
            limit:pageSize,
            offset:(page - 1) * pageSize,
            order:[['id', 'DESC']]
        });

        res.status(201).json({
            message: 'Historial de equipo de trabajo',
            pageSize: pageSize,
            nextPage: page+1,
            history: history,
        });
    } catch (error) {
        next(new handleError('Error al obtener el historial del puesto de trabajo', "SERVER_ERR"));
    }
}

const historyEquipments = async (req, res, next) => {
    try {
        const {jobPositionHistoryId} = req.params;
        const inventoryType = req.query.inventoryType??'department';
        const page = normalizeQueryParams(req.query.page);
        
        const pageSize = 10;

        const equipments = await EquipmentHistory.findAll({
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
                'inventory_type',
                'createdAt',
                'updatedAt',
                'dep_name',
                'dep_inventoryType',
                'camp_city',
                'camp_schoolType'
            ],
            include: [
                {
                    model:EquipmentHistoryFeatures,
                    as: 'equipmentHistoryFeatures',
                    attributes: ['id','description']
                }
            ],
            where:{
                jop_position_history_id:+jobPositionHistoryId,
                inventory_type:inventoryType
            },
            offset:(page - 1) * pageSize,
            limit:pageSize
        });
        
        res.status(200).json({
            message: 'Historial de equipo de trabajo',
            pageSize: pageSize,
            nextPage: page+1,
            equipments
        });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al obtener los equipos que hay en el historial del puesto de trabajo', "SERVER_ERR"));
    }
}


module.exports = {
    getHistory,
    historyEquipments
}