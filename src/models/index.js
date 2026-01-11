const Staff = require('./staff');
const Department = require('./department');
const Vehicle = require('./vehicle');
const CheckOutTime = require('./checkOutTime');
const CheckOutTimeVehicular = require('./checkOutTimeVehicular');
const Equipment = require('./equipment');
const EquipmentStatic = require('./equipmentStatic');
const EquipmentVariable = require('./equipmentVariable');
const EquipmentFeatures = require('./equipmentFeatures');
const EquipmentHistory = require('./equipmentHistory');

//Relation between Department and User
Department.hasOne(Staff, {foreignKey:'department_id'});
Staff.belongsTo(Department, {foreignKey:'department_id'});

//Relation between User and CheckOutTime
Staff.hasMany(CheckOutTime, {foreignKey: 'id_staff'});
CheckOutTime.belongsTo(Staff, {foreignKey:'id_staff'});

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

//Relation between Equipment and User
Equipment.belongsToMany(Staff, {
    through:'staff_equipment',
    foreignKey:'id_equipment',
    otherKey: 'id_staff'
});

Staff.belongsToMany(Equipment, {
    through:'staff_equipment',
    foreignKey:'id_staff',
    otherKey: 'id_equipment'
});

//Relation between Department and EquipmentHistory
Department.hasMany(EquipmentHistory, {foreignKey: 'id_department'});
EquipmentHistory.belongsTo(Department, {foreignKey: 'id_department'});

module.exports = {
    Staff,
    Department,
    Vehicle,
    CheckOutTime,
    CheckOutTimeVehicular,
    Equipment,
    EquipmentStatic,
    EquipmentVariable,
    EquipmentFeatures,
    EquipmentHistory
};