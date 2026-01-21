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
const Camp = require('./camps');

//Relation between Camp and Department
Camp.hasMany(Department, {foreignKey:'id_camps'});
Department.belongsTo(Camp, {foreignKey:'id_camps'});

//Relation between Department and User
Department.hasMany(Staff, {foreignKey:'department_id', as: 'staff'});
Staff.belongsTo(Department, {foreignKey:'department_id', as:'department' });

//Relation between User and CheckOutTime
Staff.hasMany(CheckOutTime, {foreignKey: 'id_staff', as:'checkOutTime'});
CheckOutTime.belongsTo(Staff, {foreignKey:'id_staff', as:'staff'});

//Relation between CheckOutTime and CheckOutTimeVehicular
CheckOutTime.hasOne(CheckOutTimeVehicular, {foreignKey: 'id_check_out', as:'checkOutTimeVehicular'});
CheckOutTimeVehicular.belongsTo(CheckOutTime, {foreignKey: 'id_check_out', as:'checkOutTime'});

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
    Camp,
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