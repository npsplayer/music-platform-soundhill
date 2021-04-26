const Router = require("express");
const router = new Router();
const Genre = require("../models/Genre");


router.post('/add',
    async (req, res) => {
        try {
            const { name } = req.body;
            const genreName = await Genre.findOne({name: name});
            if(genreName) {
                return res.status(400).send({ message: 'This genre already exists!' })
            }
            const genre = new Genre({name: name});
            await genre.save();
            return res.json({ message: "Genre was added!" });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);
router.get('/select',
    async (req, res) => {
        try {
            const genre = await Genre.find().sort({name: 1});
            const arr = [];
            genre.map((item, i) => {
                arr.push({value: item._id, label: item.name})
            });
            return res.send(arr);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);


module.exports = router;
