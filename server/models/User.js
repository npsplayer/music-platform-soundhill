const { Schema, model, ObjectId } = require('mongoose');

const User = new Schema({
    firstName: { type: String, default: "Unknown" },
    lastName: { type: String, default: "Unknown" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    singupDate: { type: Date },
    phoneNumber: { type: String, default: "Unknown" },
    country: { type: String, default: "Unknown" },
    role: { type: Schema.ObjectId, ref: 'Role' }
});

module.exports = model('User', User);