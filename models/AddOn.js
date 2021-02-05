var mongoose = require('mongoose');

// Will add the Currency type to the Mongoose Schema types
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

// Package we'll use to auto create URL slugs
var slug = require('slug');

var AddOnSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: { type: Currency },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, usePushEach: true })

AddOnSchema.methods.toJSON = function () {
    return {
        id: this._id,
        title: this.title, 
        price: this.price,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('AddOn', AddOnSchema)