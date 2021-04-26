const Router = require("express");
const config = require('config');
const { check, validationResult } = require("express-validator");
const router = new Router();
const authMiddleware = require('../middleware/jwt.middleware');
const PremiumType = require("../models/PremiumType");
const Premium = require("../models/Premium");
const User = require("../models/User");


router.get('/get', async (req, res) => {
    try {
        const premiumType = await PremiumType.find();
        return res.json(premiumType);
    } catch (e) {
        console.log(e);
        res.send({ message: 'Server error!' });
    }
})

router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { id } = req.body;
        let startDate = new Date();
        let endDate = new Date();
        let numOfPremPurchased;
        const premiumType = await PremiumType.findOne({_id: id });
        const user = await User.findOne({ _id: req.user.id });
        const premiumUser = await Premium.findOne({user: req.user.id});
        if(premiumUser) {
            if((startDate < premiumUser.endDate) && premiumUser) {
                return res.json({ alert: "You already have a premium subscription. Wait for it to expire to renew." });
            }
            if(premiumUser.numOfPremPurchased >= 1) {
                endDate.setMonth(startDate.getMonth() + premiumType.month);
                numOfPremPurchased = premiumUser.numOfPremPurchased + 1;
                await Premium.findOneAndUpdate({user: req.user.id}, {numOfPremPurchased, endDate});
                return res.json({isPremium: true , message: "Premium was updated!" });
            } 
        }
        else {
            endDate.setMonth(startDate.getMonth() + premiumType.month + 1);
            const premium = new Premium({user: user._id, startDate, endDate, type: id, firstPremDate: startDate})
            await premium.save();
            return res.json({isPremium: true, message: "Premium was created!" });
        }
    } catch (e) {
        console.log(e);
        res.send({ message: 'Server error!' });
    }
})

router.get('/one', async (req, res) => {
    const { id } = req.body;
    try {
        const premiumType = await PremiumType.findOne({_id: id });
        return res.json(premiumType);
    } catch (e) {
        console.log(e);
        res.send({ message: 'Server error!' });
    }
})

module.exports = router;