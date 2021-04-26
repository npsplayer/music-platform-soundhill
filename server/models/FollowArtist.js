const { Schema, model } = require('mongoose');

const FollowArtist = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    artist: {type:Schema.ObjectId, ref: 'Artist'},
    dateOfAdded: { type: String , default: new Date()},
});

module.exports = model('FollowArtist', FollowArtist);