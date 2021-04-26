const Router = require("express");
const router = new Router();
const authMiddleware = require('../middleware/jwt.middleware');
const Song = require("../models/Song");
const Album = require("../models/Album");
const Artist = require("../models/Artist");
const FollowSong = require("../models/FollowSong");
const { uploadToS3Image, uploadToS3Audio } = require('../utils/s3');
let ObjectId = require('mongoose').Types.ObjectId;
const Genre = require("../models/Genre");


router.get('/topchart',
    async (req, res) => {
        try {
            const { page } = req.query;
            let song;
            if (page) {
                if (page > 1) {
                    song = await Song.find().populate({ path: 'album', populate: { path: 'artist' } }).sort({ numOfListen: -1 }).skip((page - 1) * 15).limit(page * 15);
                } else {
                    song = await Song.find().populate({ path: 'album', populate: { path: 'artist' } }).sort({ numOfListen: -1 }).limit(15);
                }
            } else {
                song = await Song.find().populate({ path: 'album', populate: { path: 'artist' } }).sort({ numOfListen: -1 }).limit(10);
            }
            return res.json(song);

        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.get('/artist/popular/:id',
    async (req, res) => {
        try {
            const {id} = req.params;
            const { page } = req.query;
            if(!ObjectId.isValid(id)) {
                return res.status(400).send({message: "There is no such artist."})
            }
            const arr = [];

            const song = await Song.find({}).populate({ path: 'album', populate: { path: 'artist' } }).sort({ numOfListen: -1 });
            song.map((elem, i) => {
                elem.album.artist.map((art, i) => {
                    if(art._id == id) {
                        console.log(1);
                        arr.push(elem);
                    }
                }) 
            })
            if (page) {
                if (page > 1) {
                    return res.json(arr.slice((page - 1) * 14, page * 14))
                } else {
                    return res.json(arr.slice(0, 14))
                }
            } else {
                return res.json(arr.slice(0, 9));
            }

        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)


router.post('/upload', (req, res) => {
    uploadToS3Audio(req, res)
        .then(file => {
            return res.status(200).send({ file });
        })
        .catch(e => {
            res.status(400).send({ message: e.message });
        })
})

router.post('/add', authMiddleware,
    async (req, res) => {
        try {
            const { name, albumId, file, duration } = req.body;
            const song = new Song({ name, file: file.data.file, album: albumId, duration: duration });
            await song.save();
            const songs = await Song.find({ album: albumId });
            return res.send(songs);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

router.post('/follow', authMiddleware,
    async (req, res) => {
        try {
            const {id} = req.body;
            const followSongCheck = await FollowSong.findOne({user: req.user.id, song: id});
            if(followSongCheck) {
                return res.status(400).send({message: 'This track has already been added'});
            }
            const followSong = new FollowSong({user: req.user.id, song: id});
            if(followSong) {
                await followSong.save();
                return res.send({message: "You followed a track!"})
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
            const {id} = req.body;
            
            const followSong = await FollowSong.findOne({user: req.user.id, song: id});
            if(followSong) {
                return res.send({isFollow: true})
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
            const {id} = req.body;
            const followSong = await FollowSong.findOneAndDelete({"user": req.user.id, "song": id});
            return res.send({message: "You unfollowed a track!"})
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.get('/follow/tracks', authMiddleware,
    async (req, res) => {
        try {
            const {sort} = req.query;
            let followSong;
            if(sort) {
                if(sort == 0) {
                    followSong = await FollowSong.find({"user": req.user.id}).populate({ path: 'song', populate: { path: 'album', populate: {path: 'artist'} } })
                    
                    return res.json(sortArr('song.name', followSong));
                    
                } else if(sort == 1) {
                    followSong = await FollowSong.find({"user": req.user.id}).populate({ path: 'song', populate: { path: 'album', populate: {path: 'artist'} } }).sort({dateOfAdded: -1});
                    return res.json(followSong);
                } else if(sort == 2) {
                    followSong = await FollowSong.find({"user": req.user.id}).populate({ path: 'song', populate: { path: 'album', populate: {path: 'artist' } } });
                    return res.json(sortArr('song.album.name', followSong));
                }
            } else {
                followSong = await FollowSong.find({"user": req.user.id}).populate({ path: 'song', populate: { path: 'album', populate: {path: 'artist'} } }).sort({dateOfAdded: -1});
                return res.json(followSong);
            }
            
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.post('/update/listen',
    async (req, res) => {
        try {
            const { id, listen } = req.body;
            const song = await Song.findOne({ _id: id });
            const songUpdate = await Song.findOneAndUpdate({ _id: id }, { numOfListen: song.numOfListen + listen })
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

router.get('/:id',
    async (req, res) => {
        try {
            const { id } = req.params;
            const song = await Song.findOne({ _id: id }).populate({ path: 'album', populate: { path: 'artist' } });
            return res.json(song);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

let sortArr = (prop, arr) => {
    prop = prop.split('.');
    let len = prop.length;              
    arr.sort(function (a, b) {
        var i = 0;
        while( i < len ) {
            a = a[prop[i]];
            b = b[prop[i]];
            i++;
        }
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    });
    return arr;
};

module.exports = router;