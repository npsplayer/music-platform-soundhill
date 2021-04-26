const { Schema, model, ObjectId } = require('mongoose');

const Song = new Schema({
    name: { type: String, required: true },
    album: { type: Schema.ObjectId, ref: 'Album', default: null },
    numOfListen: {type: Number, default: 0},
    duration: {type: String, default: '00:00'},
    file: {type: String }
});

module.exports = model('Song', Song);