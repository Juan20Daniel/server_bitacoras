const { handleError } = require('../utils/error');
const { normalizeQueryParams } = require('../utils/queryParams');

const {
    JopPositionHistory,
    EquipmentHistory
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
        const {jobPositionId} = req.params;
        const inventory_type = req.query.inventory_type??'department';
        const page = normalizeQueryParams(req.query.page);
        console.log(page)

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
                'updatedAt'
            ],
            where:{
                jop_position_history_id:+jobPositionId,
                inventory_type:inventory_type
            },
            offset:(page - 1) * pageSize,
            limit:pageSize
        });
        
        res.status(200).json({
            message: 'Historial de equipo de trabajo',
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