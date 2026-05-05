const Camp = require('../models/camps');
const {handleError} = require('../utils/error');

const get = async (req, res, next) => {
    try {
        const camps = await Camp.findAll();
        
        res.status(200).json({message:"Campus registrados", campsList:camps})
    } catch (error) {
        next(new handleError('Error al obtener los campus', "SERVER_ERR"));
    }
}

module.exports = {
    get,
}