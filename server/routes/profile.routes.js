const Router = require("express");
const router = new Router();
const authMiddleware = require('../middleware/jwt.middleware');
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Premium = require("../models/Premium");


router.post('/update', authMiddleware,
    async (req, res) => {
        try {
            const {firstName, lastName, phoneNumber, country} = req.body;
            const user = await User.findOneAndUpdate({_id: req.user.id}, {firstName, lastName, phoneNumber, country}, {new:true});
            return res.json({
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                singupDate: user.singupDate,
                phoneNumber: user.phoneNumber,
                country: user.country     
            });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

router.post('/changepassword', authMiddleware,
    async (req, res) => {
        try {
            const {oldPassword, newPassword} = req.body;
            const user = await User.findOne({ _id: req.user.id });
            const isPassValid = bcrypt.compareSync(oldPassword, user.password);
            if (!isPassValid) {
                return res.status(400).json({ message: `Invalid password!` })
            }
            const hashPassword = await bcrypt.hash(newPassword, 8);
            await User.findOneAndUpdate({_id: req.user.id}, {password: hashPassword});
            return res.json({message: 'Password changed successfully!'});
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

router.get('/premium', authMiddleware,
    async (req, res) => {
        try {
            const premiumUser = await Premium.findOne({user: req.user.id});
            return res.json(premiumUser);
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

router.get('/unsub', authMiddleware,
    async (req, res) => {
        try {
            const premiumUser = await Premium.findOne({user: req.user.id});
            if(premiumUser) {
                await Premium.findOneAndUpdate({_id: premiumUser.id}, {endDate: new Date()})
            }
            return res.json({message: 'You have successfully unsubscribed from your premium subscription! changed successfully!'});
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error!' });
        }
    }
);

module.exports = router;