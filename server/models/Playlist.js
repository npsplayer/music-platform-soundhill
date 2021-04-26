const { Schema, model } = require('mongoose');

const Playlist = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    photoUrl: { type: String },
    genre: [{ type: Schema.ObjectId, ref: 'Genre', default: null}],
    numOfListen: {type: Number, default: 0},
    dateRelease: {type: Date, default: new Date()}
});
module.exports = model('Playlist', Playlist);