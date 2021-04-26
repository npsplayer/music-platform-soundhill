const { Schema, model } = require('mongoose');

const FollowAlbum = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    album: {type:Schema.ObjectId, ref: 'Album'},
    dateOfAdded: { type: String , default: new Date()},
});

module.exports = model('FollowAlbum', FollowAlbum);