const { Schema, model, ObjectId } = require('mongoose');

const PremiumType = new Schema({
    name: { type: String, unique: true },
    price: { type: Number, default: 0 },
    description: { type: String},
    month: {type: Number, default: 1}
});

module.exports = model('PremiumType', PremiumType);