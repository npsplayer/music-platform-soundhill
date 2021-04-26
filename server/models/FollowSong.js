const { Schema, model } = require('mongoose');

const FollowSong = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    song: {type:Schema.ObjectId, ref: 'Song'},
    dateOfAdded: { type: String , default: new Date()},
});

module.exports = model('FollowSong', FollowSong);