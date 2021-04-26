const { Schema, model, ObjectId } = require('mongoose');

const Role = new Schema({
    roleValue: { type: String, unique: true, default: "USER" },
});

module.exports = model('Role', Role);