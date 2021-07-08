const Router = require("express");
const User = require("../models/User");
const Role = require("../models/Role");
const config = require('config');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const router = new Router();
const authMiddleware = require('../middleware/jwt.middleware');
const Premium = require("../models/Premium");
const Artist = require("../models/Artist");

router.post('/registration',
  [
    check('email', "Incorrect email").isEmail().notEmpty(),
    check('password', "Password must be longer than 3 and shorter than 12").isLength({ min: 3, max: 12 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Incorrect request", errors });
      }
      const { email, password, username } = req.body;
      const candidateEmail = await User.findOne({ email });
      const candidateUsername = await User.findOne({ username });

      if (candidateEmail) {
        return res.status(400).json({ message: `User with email ${email} already exist!` })
      }
      if (candidateUsername) {
        return res.status(400).json({ message: `User with username ${username} already exist!` })
      }
      const hashPassword = await bcrypt.hash(password, 8);
      const userRole = await Role.findOne({ roleValue: "USER" });
      const adminRole = await Role.findOne({ roleValue: "ADMIN" });
      const userAdmin = await User.find({ "role": adminRole._id }).countDocuments();
      let user;
      if (userAdmin == 0) {
        user = new User({ email, password: hashPassword, username, singupDate: Date.now(), role: adminRole._id });
      } else {
        user = new User({ email, password: hashPassword, username, singupDate: Date.now(), role: userRole._id });
      }

      await user.save();
      return res.json({ message: "User was created!" });
    } catch (e) {
      console.log(e);
      res.send({ message: 'Server error!' });
    }
  }
);

router.post('/login',
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).populate('role');
      if (!user) {
        return res.status(404).json({ message: `User not found!` })
      }

      const isPassValid = bcrypt.compareSync(password, user.password);
      if (!isPassValid) {
        return res.status(400).json({ message: `Invalid password!` })
      }
      const premiumUser = await Premium.findOne({ user: user._id });
      const artist = await Artist.findOne({ user: user._id });
      const token = jwt.sign({ id: user.id }, config.secretKeyJWT, { expiresIn: "24h" });
      if (premiumUser) {
        let endDate = new Date(premiumUser.endDate || null);
        let currentDate = new Date();
        if ((currentDate < endDate) && premiumUser) {
          if (artist) {
            return res.json({
              token,
              user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                singupDate: user.singupDate,
                phoneNumber: user.phoneNumber,
                country: user.country

              },
              isPremium: true,
              isArtist: true,
              artist: {
                id: artist.id,
                name: artist.name,
                photoArtist: artist.photoArtist,
                photoCardArtist: artist.photoCardArtist,
                status: artist.status
              }
            })
          }
          return res.json({
            token,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              singupDate: user.singupDate,
              phoneNumber: user.phoneNumber,
              country: user.country,


            },
            isPremium: true,
            isArtist: false
          })
        } else {
          return res.json({
            token,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              singupDate: user.singupDate,
              phoneNumber: user.phoneNumber,
              country: user.country,
            },
            isPremium: false,
            isArtist: false
          })
        }
      } else {
        return res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            singupDate: user.singupDate,
            phoneNumber: user.phoneNumber,
            country: user.country,
          },
          isPremium: false,
          isArtist: false
        })
      }
    } catch (e) {
      console.log(e);
      res.send({ message: 'Server error!' });
    }
  }
);

router.get('/auth', authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.user.id });
      const premiumUser = await Premium.findOne({ user: req.user.id });
      const artist = await Artist.findOne({ user: req.user.id });
      const token = jwt.sign({ id: user.id }, config.secretKeyJWT, { expiresIn: "24h" });
      if (premiumUser) {
        let endDate = new Date(premiumUser.endDate || null);
        let currentDate = new Date();
        if ((currentDate < endDate) && premiumUser) {
          if (artist) {
            return res.json({
              token,
              user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                singupDate: user.singupDate,
                phoneNumber: user.phoneNumber,
                country: user.country

              },
              isPremium: true,
              isArtist: true,
              artist: {
                id: artist.id,
                name: artist.name,
                photoArtist: artist.photoArtist,
                photoCardArtist: artist.photoCardArtist,
                status: artist.status
              }
            })
          }
          return res.json({
            token,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              singupDate: user.singupDate,
              phoneNumber: user.phoneNumber,
              country: user.country

            },
            isPremium: true,
            isArtist: false

          })
        } else {
          return res.json({
            token,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              singupDate: user.singupDate,
              phoneNumber: user.phoneNumber,
              country: user.country,
            },
            isPremium: false,
            isArtist: false
          })
        }
      } else {
        return res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            singupDate: user.singupDate,
            phoneNumber: user.phoneNumber,
            country: user.country,
          },
          isPremium: false,
          isArtist: false
        })
      }


    } catch (e) {
      console.log(e);
      res.send({ message: 'Server error!' });
    }
  }
);

module.exports = router;