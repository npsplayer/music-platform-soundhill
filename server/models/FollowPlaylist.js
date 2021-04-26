const { Schema, model } = require('mongoose');

const FollowPlaylist = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    playlist: {type:Schema.ObjectId, ref: 'Playlist'},
    dateOfAdded: { type: String , default: new Date()},
});

module.exports = model('FollowPlaylist', FollowPlaylist);