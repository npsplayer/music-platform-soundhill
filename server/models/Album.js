const { Schema, model } = require('mongoose');

const Album = new Schema({
    artist: [{ type: Schema.ObjectId, ref: 'Artist' }],
    name: { type: String, required: true },
    dateRelease: { type: Date },
    description: { type: String },
    photoUrl: { type: String },
    genre: [{ type: Schema.ObjectId, ref: 'Genre', default: null}],
    counry: { type: Schema.ObjectId, ref: 'Country', default: null},
    language: { type: Schema.ObjectId, ref: 'Language', default: null},
    status: { type: String, default: "in progress" }
});

module.exports = model('Album', Album);