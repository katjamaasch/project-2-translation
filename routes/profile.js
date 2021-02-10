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
//const bcryptjs = require('bcryptjs');
const routeGuard = require('./../middleware/route-guard');

const Project = require('./../models/project');

router.get('/', routeGuard, (req, res, next) => {
  Project.find({ status: 'in progress' })
    .then((projects) => {
      res.render('profile', { projects });
    })
    .catch((error) => {
      next(error);
    });
});

/* {}
  res.render('profile');
});*/

module.exports = router;
