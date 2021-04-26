const Router = require("express");
const config = require('config');
const { check, validationResult } = require("express-validator");
const router = new Router();
const authMiddleware = require('../middleware/jwt.middleware');
const User = require("../models/User");
const PremiumType = require("../models/PremiumType");
const Premium = require("../models/Premium");
const stripe = require("stripe")("sk_test_51IdbKqEOm5o7ytGFQqjgek39I0DjdUb53GhopmjJoEfSkRutGZRu4Kceig6b3gnHq3HICIapTj2tvkGKxMpERI7600KWzM94bo");


router.post('/premium', authMiddleware, async (req, res) => {
    try {
        const { id } = req.body;
        let startDate = new Date();
        const premiumType = await PremiumType.findOne({ _id: id });
        const user = await User.findOne({ _id: req.user.id });
        const premiumUser = await Premium.findOne({user: req.user.id});
        if(premiumUser) {
            if((startDate < premiumUser.endDate) && premiumUser) {
                return res.json({ alert: "You already have a premium subscription. Wait for it to expire to renew." });
            }
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.ceil(premiumType.price * 100),
            currency: "usd",
            description: `Customer: ${user.email}. ${premiumType.description}`,
            receipt_email: user.email
          });

        res.json({ clientSecretKey: paymentIntent.client_secret })
    } catch (e) {
        console.log(e);
        res.send({ message: 'Server error!' });
    }
})

module.exports = router;