const { Schema, model } = require('mongoose');

const PlaylistSong = new Schema({
    playlist: { type: Schema.ObjectId, ref: 'Playlist' },
    song: {type: Schema.ObjectId, ref: 'Song' }
});

module.exports = model('PlaylistSong', PlaylistSong);