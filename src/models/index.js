const User = require('./user');
const Department = require('./department');
const Vehicle = require('./vehicle');
const CheckOutTime = require('./checkOutTime');
const CheckOutTimeVehicular = require('./checkOutTimeVehicular');
const Equipment = require('./equipment');
const EquipmentStatic = require('./equipmentStatic');
const EquipmentVariable = require('./equipmentVariable');
const EquipmentFeatures = require('./equipmentFeatures');

//Relation between Department and User
Department.hasOne(User, {foreignKey:'departmentId'});
User.belongsTo(Department, {foreignKey:'departmentId'});

//Relation between User and CheckOutTime
User.hasMany(CheckOutTime, {foreignKey: 'id_user'});
CheckOutTime.belongsTo(User, {foreignKey:'id_user'});

//Relation between CheckOutTime and CheckOutTimeVehicular
CheckOutTime.hasOne(CheckOutTimeVehicular, {foreignKey: 'id_check_out'});
CheckOutTimeVehicular.belongsTo(CheckOutTime, {foreignKey: 'id_check_out'});

//Relation between Vehicle and CheckOutTimeVehicular
Vehicle.hasMany(CheckOutTimeVehicular, {foreignKey: 'id_vehicle'});
CheckOutTimeVehicular.belongsTo(Vehicle, {foreignKey: 'id_vehicle'});

//Relation between Equipment and EquipmentStatic
Equipment.hasOne(EquipmentStatic, {foreignKey: 'id_equipment'});
EquipmentStatic.belongsTo(Equipment, {foreignKey: 'id_equipment'});

//Relation between Equipment and EquipmentVariable
Equipment.hasOne(EquipmentVariable, {foreignKey: 'id_equipment'});
EquipmentVariable.belongsTo(Equipment, {foreignKey: 'id_equipment'});

//Relation between Equipment and EquipmentFeatures
Equipment.hasMany(EquipmentFeatures, {foreignKey: 'id_equipment'});
EquipmentFeatures.belongsTo(Equipment, {foreignKey: 'id_equipment'});

module.exports = {
    User,
    Department,
    Vehicle,
    CheckOutTime,
    CheckOutTimeVehicular,
    Equipment,
    EquipmentStatic,
    EquipmentVariable,
    EquipmentFeatures
};