/*
This is a general router for the api. Redirects /api/{routes} to
proper routes
*/

var router = require('express').Router();

router.use('/', require('./api'));

module.exports = router;
