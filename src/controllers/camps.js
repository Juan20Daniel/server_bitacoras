const Camp = require('../models/camps');

const get = async (req, res, next) => {
    try {
        const { idCamp } = req.params;
        const camps = await Camp.findAll();
        
        res.status(200).json({message:"Campus registrados", data:camps})
    } catch (error) {
        next(error);
    }
}

module.exports = {
    get,
}