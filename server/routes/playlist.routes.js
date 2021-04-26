const Router = require("express");
const router = new Router();
const authMiddleware = require('../middleware/jwt.middleware');
const FollowPlaylist = require("../models/FollowPlaylist");
const Playlist = require("../models/Playlist");
const PlaylistSong = require("../models/PlaylistSong");
let ObjectId = require('mongoose').Types.ObjectId;

const { uploadToS3Image } = require('../utils/s3');



router.get('/newplaylist',
async (req, res) => {
    try {
        const { page } = req.query;
        let playlist;
        if (page) {
            if (page > 1) {
                playlist = await Playlist.find().sort({ dateRegister: -1 }).skip((page - 1) * 5).limit(page * 5);
            } else {
                playlist = await Playlist.find().sort({ dateRegister: -1 }).limit(5);
            }
        } else {
            playlist = await Playlist.find().sort({ dateRegister: -1 }).limit(5);
        }
        return res.json(playlist);
    } catch (e) {
        console.log(e);
        res.send({ message: 'Server error!' });
    }
}
)

router.post('/add', authMiddleware,
    async (req, res) => {
        try {
            const { name, genre } = req.body;
            const genreId = [];
            genre.map((item, i) => {
                genreId.push(item.value);
            })
            const playlist = new Playlist({ dateRelease: Date.now(), name, user: req.user.id, genre: genreId });
            await playlist.save();
            res.send({ id: playlist._id });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

router.post('/uploadphoto', async (req, res) => {
    uploadToS3Image(req, res)
        .then(file => {
            return res.status(200).send({ file });
        })
        .catch(e => {
            res.status(400).send({ message: e.message });
        })

})

router.post('/updatephoto', authMiddleware,
    async (req, res) => {
        try {
            const { playlistId, fileImage } = req.body;
            await Playlist.findOneAndUpdate({ _id: playlistId }, { photoUrl: fileImage }, { new: true });
            return res.status(200).send({ message: 'great!' });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.post('/track/add', authMiddleware,
    async (req, res) => {
        try {
            const { tracks, playlistId } = req.body;
            if (tracks) {
                for (let i = 0; i < tracks.length; i++) {
                    const trackPlaylist = new PlaylistSong({ playlist: playlistId, song: tracks[i] });
                    await trackPlaylist.save();
                }

            }
            const playlist = await PlaylistSong.find({ _id: playlistId });
            return res.json(playlist);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.post('/track/delete/:id', authMiddleware,
    async (req, res) => {
        try {
            const { playlistId } = req.body;
            const { id } = req.params;
            const playlistDelete = await PlaylistSong.findOneAndDelete({ playlist: playlistId, song: id });
            if (playlistDelete) {
                const playlist = await PlaylistSong.find({ _id: playlistId });
                return res.json(playlist);
            }
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.get('/get', authMiddleware,
    async (req, res) => {
        try {

            if (!ObjectId.isValid(req.user.id)) {
                return res.status(400).send({ message: "There is no such user." })
            }
            const playlist = await Playlist.find({ user: req.user.id }).populate('playlist').populate('song').populate('genre');;
            return res.json(playlist);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.get('/songs/:id',
    async (req, res) => {
        try {

            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).send({ message: "There is no such playlist." })
            }
            const playlist = await PlaylistSong.find({ playlist: req.params.id }).populate('playlist').populate({ path: 'song', populate: { path: 'album', populate: { path: 'artist' } } });
            return res.json(playlist);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)


router.get('/:id',
    async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).send({ message: "There is no such playlist." })
            }
            const playlist = await Playlist.findOne({ _id: req.params.id }).populate('genre');
            return res.json(playlist);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.post('/follow', authMiddleware,
    async (req, res) => {
        try {
            const { id } = req.body;
            const followPlaylistCheck = await FollowPlaylist.findOne({ user: req.user.id, playlist: id });
            if (followPlaylistCheck) {
                return res.status(400).send({ message: 'This playlist has already been added' });
            }
            const followPlaylist = new FollowPlaylist({ user: req.user.id, playlist: id });
            if (followPlaylist) {
                await followPlaylist.save();
                return res.send({ message: "You followed a playlist!" })
            }

        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.post('/followcheck', authMiddleware,
    async (req, res) => {
        try {
            const { id } = req.body;
            const followPlaylist = await FollowPlaylist.findOne({ user: req.user.id, playlist: id });
            console.log(id);
            if (followPlaylist) {
                return res.send({ isFollow: true })
            }
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.post('/unfollow', authMiddleware,
    async (req, res) => {
        try {
            const { id } = req.body;
            const followPlaylist = await FollowPlaylist.findOneAndDelete({ "user": req.user.id, "playlist": id });
            return res.send({ message: "You unfollowed a playlist!" })
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.get('/follow/playlist', authMiddleware,
    async (req, res) => {
        try {
            let followPlaylist = await FollowPlaylist.find({ "user": req.user.id }).populate({ path: 'playlist'}).sort({ dateOfAdded: -1 });
            return res.json(followPlaylist);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)


router.get('/follow/:id', authMiddleware,
    async (req, res) => {
        try {
            let followPlaylist = await FollowPlaylist.find({ "user": req.user.id }).populate({ path: 'playlist'}).sort({ dateOfAdded: -1 });
            return res.json(followPlaylist);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)


module.exports = router;
