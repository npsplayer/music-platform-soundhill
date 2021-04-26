const { Schema, model, ObjectId } = require('mongoose');

const Premium = new Schema({
    user: { type: Schema.ObjectId, ref: 'User', unique: true },
    startDate: { type: Date },
    endDate: { type: Date },
    type: { type: Schema.ObjectId, ref: 'PremiumType' },
    firstPremDate: { type: Date },
    numOfPremPurchased: { type: Number, default: 1 },
    
});

module.exports = model('PremiumAcc', Premium);