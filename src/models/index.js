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
const EquipmentHistory = require('./equipmentHistory');

const Camp = require('./camps');

//Relation between Camp and Department
Camp.hasMany(Department, {foreignKey:'camps_id', as:'deparment'});
Department.belongsTo(Camp, {foreignKey:'camps_id', as:'camp'});

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

//Relation between Department and article 
Department.hasMany(Article, {foreignKey:'department_id', as:'article'});
Article.belongsTo(Department, {foreignKey:'department_id', as:'department'});

//Relation between Article and ArticleEntryHistory 
Article.hasMany(ArticleEntryHistory, {foreignKey:'article_id', as:'articleEntryHistory'});
ArticleEntryHistory.belongsTo(Article, {foreignKey:'article_id', as:'article'});

//Relation between Article and ArticleOutputHistory 
Article.hasMany(ArticleOutputHistory, {foreignKey:'article_id', as:'articleOutputHistory'});
ArticleOutputHistory.belongsTo(Article, {foreignKey:'article_id', as:'article'});

//Relation between Department and Equipment
Department.hasMany(Equipment, {foreignKey:'department_id', as:'equipment'});
Equipment.belongsTo(Department, {foreignKey:'department_id', as:'department'});

//Relation between Equipment and EquipmentFeatures
Equipment.hasMany(EquipmentFeatures, {foreignKey: 'equipment_id', as:'equipmentFeatures'});
EquipmentFeatures.belongsTo(Equipment, {foreignKey: 'equipment_id', as:'equipment'});

//Relation between Equipment and Staff
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
    EquipmentFeatures,
    EquipmentHistory
};