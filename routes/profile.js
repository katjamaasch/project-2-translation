//'use strict';

//const { Router } = require('express');
//const User = require('./../models/user');
//const Project = require('./../models/project');
//const Textblock = require('./../models/textblock');

//const routeGuard = require('./../middleware/route-guard');

//module.exports = router;

'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('./../middleware/route-guard');

/*router.get('/', (req, res, next) => {
  res.render('home');
});*/

router.get('/profile', routeGuard, (req, res, next) => {
  res.render('profile');
});

module.exports = router;
