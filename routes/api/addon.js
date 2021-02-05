var router = require('express').Router();
var mongoose = require('mongoose');
var AddOn = mongoose.model('AddOn')
var User = mongoose.model('User')
var auth = require('../auth');

router.post('/', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user) { return res.sendStatus(401); }

        let newAddOn = new AddOn()

        newAddOn.title = req.body.title
        newAddOn.price = req.body.price
        newAddOn.createdBy = user

        return newAddOn.save().then(() => {
            return res.sendStatus(201);
        }).catch(() => {
            return res.sendStatus(400)
        })
    }).catch(next);
})

router.get('/', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user) { return res.sendStatus(401); }

        return AddOn.findOne({ createdBy : user, _id: req.body.id }).then((result) => {
            res.status(200)
            return res.json({
                result: result
            })
        })
    }).catch(next);
})

router.get('/all', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user) { return res.sendStatus(401); }

        return Promise.all([
            AddOn.find({ createdBy : user }).exec()
        ]).then((result) => {
            let addons = result[0]
            res.status(200)
            return res.json({
                result: addons.map( function (addon) {
                    return addon.toJSON()
                })
            })
        })
    }).catch(next);
})

router.delete('/', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user) { return res.sendStatus(401); }
        return AddOn.deleteOne({ _id: req.body.id, createdBy: user }).then(() => {
            return res.sendStatus(200)
        })
    }).catch(next);
})

router.put('/', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user) { return res.sendStatus(401); }

        return AddOn.findOne({ createdBy : user, _id: req.body.id }).then((addon) => {
            
            //Error check
            if (typeof req.body.title !== "string" || 
                typeof req.body.price !== "number") {
                res.status(400)
                return res.send("Invalid data type")
            }
            
            if (req.body.title) {
                addon.title = req.body.title
            }
            if (req.body.price) {
                addon.price = req.body.price
            }
            return addon.save().then(() => {
                return res.sendStatus(201)
            })
        })
    }).catch(next);
})
module.exports = router