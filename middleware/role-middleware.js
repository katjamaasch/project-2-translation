'use strict';

module.exports = (req, res, next) => {
  //res.locals.user = req.user;
  if (req.user.role[0]) {
    let userIsPublisher;
    userIsPublisher = true;
    next();
    //} else {
    //const error = new Error('User is a viewer');
    //error.status = 401;
    // next(error);
  }
};
