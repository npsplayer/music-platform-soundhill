const Router = require("express");
const router = new Router();
const authMiddleware = require('../middleware/jwt.middleware');
const Song = require("../models/Song");
const Album = require("../models/Album");
const { uploadToS3Image } = require('../utils/s3');
let ObjectId = require('mongoose').Types.ObjectId;

const FollowAlbum = require("../models/FollowAlbum");




router.get('/newrelease',
    async (req, res) => {
        try {
            const { page } = req.query;
            let album;
            if (page) {
                if (page > 1) {
                    album = await Album.find({ status: 'active' }).populate('artist').populate('genre').skip((page - 1) * 5).limit(page * 5);
                } else {
                    album = await Album.find({ status: 'active' }).populate('artist').populate('genre').limit(5);
                }
            } else {
                album = await Album.find({ status: 'active' }).populate('artist').populate('genre').limit(5);
            }
            return res.json(album);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

router.get('/:id',
    async (req, res) => {
        try {
            if(ObjectId.isValid(req.params.id)) {
                const album = await Album.findOne({ _id: req.params.id }).populate('artist').populate('genre');
                return res.json(album);
            } else {
                return res.status(400).send({message: "There is no such album."})
            }
            
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);



router.get('/artist/release/:id',
    async (req, res) => {
        try {
            const { page } = req.query;
            let album;
            if(!ObjectId.isValid(req.params.id)) {
                return res.status(400).send({message: "There is no such artist."})
            }
            if (page) {
                if (page > 1) {
                    album = await Album.find({artist: [req.params.id], status: 'active' }).populate('artist').populate('genre').sort({ dateRelease: -1 }).skip((page - 1) * 5).limit(page * 5);
                } else {
                    album = await Album.find({artist: [req.params.id], status: 'active' }).populate('artist').populate('genre').sort({ dateRelease: -1 }).limit(5);
                }
            } else {
                album = await Album.find({artist: [req.params.id], status: 'active' }).populate('artist').populate('genre').sort({ dateRelease: -1 }).limit(5);
            }
            return res.json(album);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

router.get('/artist/unrelease/:id',
    async (req, res) => {
        try {
            const { page } = req.query;
            let album;
            if(!ObjectId.isValid(req.params.id)) {
                return res.status(400).send({message: "There is no such artist."})
            }
            if (page) {
                if (page > 1) {
                    album = await Album.find({ artist: [req.params.id], status: 'in progress' }).populate('artist').populate('genre').sort({ dateRelease: -1 }).skip((page - 1) * 5).limit(page * 5);
                } else {
                    album = await Album.find({ artist: [req.params.id], status: 'in progress' }).populate('artist').populate('genre').sort({ dateRelease: -1 }).limit(5);
                }
            } else {
                album = await Album.find({ artist: [req.params.id], status: 'in progress' }).populate('artist').populate('genre').sort({ dateRelease: -1 }).limit(5);
            }
            return res.json(album);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

router.get('/songs/:id',
    async (req, res) => {
        try {
            const songs = await Song.find({ album: req.params.id }).populate({ path: 'album', populate: { path: 'artist' } });
            if(songs.length > 0) {
                return res.json(songs);
            } else {
                return res.status(400).send({message: 'There are no tracks in this album or no such album exists.'})
            }
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { id, name, description, genre } = req.body;
        const genreId = [];
        genre.map((item, i) => {
            genreId.push(item.value);
        })
        const album = new Album({ dateRelease: Date.now(), description, name, artist: [id], genre: genreId });
        await album.save();
        res.send({ id: album._id });
    } catch (e) {
        console.log(e);
        res.send({ message: 'Server error!' });
    }
})

router.post('/release', authMiddleware, async (req, res) => {
    try {
        const { id } = req.body;
        await Album.findOneAndUpdate({_id: id}, { status: 'active' }, { new: true });
            return res.status(200).send({ message: 'great!' });
    } catch (e) {
        console.log(e);
        res.send({ message: 'Server error!' });
    }
})

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
            const { albumId, fileImage } = req.body;
            await Album.findOneAndUpdate({ _id: albumId }, { photoUrl: fileImage }, { new: true });
            return res.status(200).send({ message: 'great!' });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.post('/follow', authMiddleware,
    async (req, res) => {
        try {
            const {id} = req.body;
            const followAlbumCheck = await FollowAlbum.findOne({user: req.user.id, album: id});
            if(followAlbumCheck) {
                return res.status(400).send({message: 'This track has already been added'});
            }
            const followAlbum = new FollowAlbum({user: req.user.id, album: id});
            if(followAlbum) {
                await followAlbum.save();
                return res.send({message: "You followed a album!"})
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
            
            const followAlbum = await FollowAlbum.findOne({user: req.user.id, album: id}).populate({ path: 'album'});
            if(followAlbum) {
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
            const followAlbum = await FollowAlbum.findOneAndDelete({"user": req.user.id, "album": id}).populate({ path: 'album'});
            return res.send({message: "You unfollowed a album!"})
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.get('/follow/album', authMiddleware,
    async (req, res) => {
        try {
            const {sort} = req.query;
            let followAlbum = await FollowAlbum.find({"user": req.user.id}).populate({ path: 'album'}).sort({dateOfAdded: -1});
                return res.json(followAlbum);
            
            
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)


module.exports = router;