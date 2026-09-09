const Staff = require('./staff');
const Department = require('./department');
const Vehicle = require('./vehicle');
const CheckOut = require('./checkOut');
const CheckOutVehicular = require('./checkOutVehicular');

const Article = require('./article');
const ArticleEntryHistory = require('./articleEntryHistory');
const ArticleOutputHistory = require('./articleOutputHistory');

const Equipment = require('./equipment');
const EquipmentFeatures = require('./equipmentFeatures');

const JopPosition = require('./jopPosition');

const Camp = require('./camps');

const JopPositionEquipment = require('./jopPositionEquipment');
const JopPositionHistory = require('./jopPositionHistory');
const EquipmentHistory = require('./equipmentHistory');

//Relation between Camp and Department
Camp.hasMany(Department, {foreignKey:'camps_id', as:'deparment'});
Department.belongsTo(Camp, {foreignKey:'camps_id', as:'camp'});

//Relation between User and CheckOut
Staff.hasMany(CheckOut, {foreignKey: 'staff_id', as:'checkOut'});
CheckOut.belongsTo(Staff, {foreignKey:'staff_id', as:'staff'});

//Relation between CheckOut and CheckOutVehicular
CheckOut.hasOne(CheckOutVehicular, {foreignKey: 'check_out_id', as:'checkOutVehicular'});
CheckOutVehicular.belongsTo(CheckOut, {foreignKey: 'check_out_id', as:'checkOut'});

//Relation between Vehicle and CheckOutVehicular
Vehicle.hasMany(CheckOutVehicular, {foreignKey: 'vehicle_id', as:'checkOutVehicular'});
CheckOutVehicular.belongsTo(Vehicle, {foreignKey: 'vehicle_id', as:'vehicle'});

//Relation between Department and article 
Department.hasMany(Article, {foreignKey:'department_id', as:'article'});
Article.belongsTo(Department, {foreignKey:'department_id', as:'department'});

//Relation between Article and ArticleEntryHistory 
Article.hasMany(ArticleEntryHistory, {foreignKey:'article_id', as:'articleEntryHistory'});
ArticleEntryHistory.belongsTo(Article, {foreignKey:'article_id', as:'article'});

//Relation between Article and ArticleOutputHistory 
Article.hasMany(ArticleOutputHistory, {foreignKey:'article_id', as:'articleOutputHistory'});
ArticleOutputHistory.belongsTo(Article, {foreignKey:'article_id', as:'article'});

//Relation between ArticleOutputHistory and Employee
Staff.hasOne(ArticleOutputHistory, {foreignKey:'staff_id', as:'articleOutputHistory'});
ArticleOutputHistory.belongsTo(Staff, {foreignKey:'staff_id', as:'staff'});

//Relation between Department and Equipment
Department.hasMany(Equipment, {foreignKey:'department_id', as:'equipment'});
Equipment.belongsTo(Department, {foreignKey:'department_id', as:'department'});

//Relation between Department and JopPosition
Department.hasMany(JopPosition, {foreignKey: 'department_id', as:'jopPosition'});
JopPosition.belongsTo(Department, {foreignKey: 'department_id', as:'department'});

//Relation between JopPosition and Employee
JopPosition.hasOne(Staff, {foreignKey:'jop_position_id', as:'staff'});
Staff.belongsTo(JopPosition, {foreignKey:'jop_position_id', as:'jopPosition'});

//Relation between Equipment and EquipmentFeatures
Equipment.hasMany(EquipmentFeatures, {foreignKey: 'equipment_id', as:'equipmentFeatures'});
EquipmentFeatures.belongsTo(Equipment, {foreignKey: 'equipment_id', as:'equipment'});

Equipment.belongsToMany(JopPosition, {
    through: JopPositionEquipment,
    foreignKey: 'equipment_id',
    otherKey: 'jop_position_id',
    as: 'jopPosition'
});

JopPosition.belongsToMany(Equipment, {
    through: JopPositionEquipment,
    foreignKey: 'jop_position_id',
    otherKey: 'equipment_id',
    as: 'equipment'
});

//Relation between JopPosition and JopPositionHistory
JopPosition.hasMany(JopPositionHistory, {foreignKey:'jop_position_id', as:'jopPositionHistory'});
JopPositionHistory.belongsTo(JopPosition, {foreignKey:'jop_position_id', as:'jopPosition'});

//Relation between JopPositionHistory and EquipmentHistory
JopPositionHistory.hasMany(EquipmentHistory, {foreignKey:'jop_position_history_id', as:'equipmentHistory'});
EquipmentHistory.belongsTo(JopPositionHistory, {foreignKey:'jop_position_history_id', as:'jopPositionHistory'})

module.exports = {
    Article,
    ArticleEntryHistory,
    ArticleOutputHistory,
    Camp,
    Staff,
    Department,
    Vehicle,
    CheckOut,
    CheckOutVehicular,
    Equipment,
    EquipmentFeatures,
    JopPosition,
    JopPositionEquipment,
    JopPositionHistory,
    EquipmentHistory
};