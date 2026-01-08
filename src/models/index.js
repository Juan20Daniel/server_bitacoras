const User = require('./user');
const Department = require('./department');

//Relation between Department and User
Department.hasOne(User);
User.belongsTo(Department);

module.exports = {
    User,
    Department,
};