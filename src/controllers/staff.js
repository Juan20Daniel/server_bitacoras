const { Staff, Department } = require('../models');
const { handleError } = require('../utils/error');

const getAll = async (req, res, next) => {
  try {
    const staff = await Staff.findAll({
      attributes:['id', 'firstname', 'lastname'],
      where: { 
        active:true
      }
    });
    res.status(200).json({
      message:'Lista de personal', 
      staffList:staff
    });
  } catch (error) {
    next(new handleError('Error al obtener la lista del personal', "SERVER_ERR"));
  }
};

const getByCampId = async (req, res, next) => {
  try {
    const {campId} = req.params;
    const staff = await Staff.findAll({
      attributes:['id', 'firstname', 'lastname'],
      include: [
        {
          model:Department,
          as: 'department',
          where: {camps_id:campId},
          attributes:[]
        }
      ],
      where: { 
        active:true
      }
    });
    res.status(200).json({
      message:'Lista de personal por campus', 
      staffList:staff
    });
  } catch (error) {
    next(new handleError('Error al obtener la lista del personal por campus', "SERVER_ERR"));
  }
};


module.exports = {
  getAll,
  getByCampId,
};