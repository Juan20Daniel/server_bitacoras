const Staff = require('./staff');
const Department = require('./department');
const Vehicle = require('./vehicle');
const CheckOut = require('./checkOut');
const CheckOutVehicular = require('./checkOutVehicular');
const Equipment = require('./equipment');
const EquipmentStatic = require('./equipmentStatic');
const EquipmentVariable = require('./equipmentVariable');
const EquipmentFeatures = require('./equipmentFeatures');
const EquipmentHistory = require('./equipmentHistory');
const Camp = require('./camps');

//Relation between Camp and Department
Camp.hasMany(Department, {foreignKey:'camps_id'});
Department.belongsTo(Camp, {foreignKey:'camps_id'});

//Relation between Department and User
Department.hasMany(Staff, {foreignKey:'department_id', as: 'staff'});
Staff.belongsTo(Department, {foreignKey:'department_id', as:'department' });

//Relation between User and CheckOut
Staff.hasMany(CheckOut, {foreignKey: 'staff_id', as:'checkOut'});
CheckOut.belongsTo(Staff, {foreignKey:'staff_id', as:'staff'});

//Relation between CheckOut and CheckOutVehicular
CheckOut.hasOne(CheckOutVehicular, {foreignKey: 'check_out_id', as:'checkOutVehicular'});
CheckOutVehicular.belongsTo(CheckOut, {foreignKey: 'check_out_id', as:'checkOut'});

//Relation between Vehicle and CheckOutVehicular
Vehicle.hasMany(CheckOutVehicular, {foreignKey: 'vehicle_id', as:'checkOutVehicular'});
CheckOutVehicular.belongsTo(Vehicle, {foreignKey: 'vehicle_id', as:'vehicle'});

//Relation between Equipment and EquipmentStatic
Equipment.hasOne(EquipmentStatic, {foreignKey: 'equipment_id'});
EquipmentStatic.belongsTo(Equipment, {foreignKey: 'equipment_id'});

//Relation between Equipment and EquipmentVariable
Equipment.hasOne(EquipmentVariable, {foreignKey: 'equipment_id'});
EquipmentVariable.belongsTo(Equipment, {foreignKey: 'equipment_id'});

//Relation between Equipment and EquipmentFeatures
Equipment.hasMany(EquipmentFeatures, {foreignKey: 'equipment_id'});
EquipmentFeatures.belongsTo(Equipment, {foreignKey: 'equipment_id'});

//Relation between Equipment and User
Equipment.belongsToMany(Staff, {
    through:'staff_equipment',
    foreignKey:'equipment_id',
    otherKey: 'staff_id'
});

Staff.belongsToMany(Equipment, {
    through:'staff_equipment',
    foreignKey:'staff_id',
    otherKey: 'equipment_id'
});

//Relation between Department and EquipmentHistory
Department.hasMany(EquipmentHistory, {foreignKey: 'department_id'});
EquipmentHistory.belongsTo(Department, {foreignKey: 'department_id'});

module.exports = {
    Camp,
    Staff,
    Department,
    Vehicle,
    CheckOut,
    CheckOutVehicular,
    Equipment,
    EquipmentStatic,
    EquipmentVariable,
    EquipmentFeatures,
    EquipmentHistory
};