const { Schema, model } = require('mongoose');

const Artist = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    name: { type: String, required: true, unique: true },
    photoArtist: { type: String , default: null},
    photoCardArtist: {type: String, default: null},
    dateRegistr: {type: Date, default: new Date()},
    status: {type: String, default: "in progress"}
});

module.exports = model('Artist', Artist);