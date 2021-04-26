const Router = require("express");
const router = new Router();
const authMiddleware = require('../middleware/jwt.middleware');
const { uploadToS3Audio, uploadToS3Image } = require('../utils/s3');
const User = require("../models/User");
const Artist = require("../models/Artist");
let ObjectId = require('mongoose').Types.ObjectId;

const FollowArtist = require("../models/FollowArtist");



router.get('/newartist',
    async (req, res) => {
        try {
            const { page } = req.query;
            let artist;
            if (page) {
                if (page > 1) {
                    artist = await Artist.find({ status: 'active' }).sort({ dateRegister: -1 }).skip((page - 1) * 5).limit(page * 5);
                } else {
                    artist = await Artist.find({ status: 'active' }).sort({ dateRegister: -1 }).limit(5);
                }
            } else {
                artist = await Artist.find({ status: 'active' }).sort({ dateRegister: -1 }).limit(5);
            }
            return res.json(artist);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);


router.post('/create', authMiddleware,
    async (req, res) => {
        try {
            const { name } = req.body;
            const ArtistName = await Artist.findOne({ name: name });
            if (ArtistName) {
                return res.status(400).send({ message: "An artist with that name already exists." })
            }
            const artist = new Artist({ user: req.user.id, name, status: 'active' });
            await artist.save();
            return res.json({
                artist: {
                    id: artist.id,
                    name: artist.name,
                    photoArtist: artist.photoArtist,
                    photoCardArtist: artist.photoCardArtist,
                    status: artist.status
                },
                isArtist: true,
                message: "An application for a music artist has been sent. The status will change after the manager has checked."
            });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);


router.post('/upload', (req, res) => {
    uploadToS3Image(req, res)
        .then(file => {
            return res.status(200).send({ file });
        })
        .catch(e => {
            res.status(400).send({ message: e.message });
        })
})

router.post('/updateimage', authMiddleware,
    async (req, res) => {
        try {
            const { fileImage } = req.body;
            const artist = await Artist.findOneAndUpdate({ user: req.user.id }, { photoArtist: fileImage }, { new: true });
            return res.json({
                artist: {
                    id: artist.id,
                    name: artist.name,
                    photoArtist: artist.photoArtist,
                    photoCardArtist: artist.photoCardArtist,
                    status: artist.status
                },
                isArtist: true,
                message: "Image successfully modified!"
            });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);



router.post('/updatecardimage', authMiddleware,
    async (req, res) => {
        try {
            const { fileImage } = req.body;
            const artist = await Artist.findOneAndUpdate({ user: req.user.id }, { photoCardArtist: fileImage }, { new: true });
            return res.json({
                artist: {
                    id: artist.id,
                    name: artist.name,
                    photoArtist: artist.photoArtist,
                    photoCardArtist: artist.photoCardArtist,
                    status: artist.status
                },
                isArtist: true,
                message: "Image Card successfully modified!"
            });
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
            if (!ObjectId.isValid(id)) {
                res.status(400).send({ message: 'There is no such artist.' })
            }
            const artist = await Artist.findOne({ _id: id });
            return res.json({
                name: artist.name,
                photoArtist: artist.photoArtist,
                photoCardArtist: artist.photoCardArtist
            });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

router.post('/follow', authMiddleware,
    async (req, res) => {
        try {
            const { id } = req.body;
            const followArtistCheck = await FollowArtist.findOne({ user: req.user.id, artist: id });
            if (followArtistCheck) {
                return res.status(400).send({ message: 'This track has already been added' });
            }
            const followArtist = new FollowArtist({ user: req.user.id, artist: id });
            if (followArtist) {
                await followArtist.save();
                return res.send({ message: "You followed a artist!" })
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

            const followArtist = await FollowArtist.findOne({ user: req.user.id, artist: id }).populate({ path: 'artist' });
            if (followArtist) {
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
            const followArtist = await FollowArtist.findOneAndDelete({ "user": req.user.id, "artist": id }).populate({ path: 'artist' });
            return res.send({ message: "You unfollowed a artist!" })
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)

router.get('/follow/artist', authMiddleware,
    async (req, res) => {
        try {
            const { sort } = req.query;
            let followArtist = await FollowArtist.find({ "user": req.user.id }).populate({ path: 'artist' }).sort({ dateOfAdded: -1 });
            return res.json(followArtist);


        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
)




module.exports = router;