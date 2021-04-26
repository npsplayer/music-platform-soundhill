const { Schema, model, ObjectId } = require('mongoose');

const Genre = new Schema({
    name: { type: String, required: true, unique: true },
    photoUrl: { type: String, default: null }
});

module.exports = model('Genre', Genre);