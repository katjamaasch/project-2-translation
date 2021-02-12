'use strict';

module.exports = (req, res, next) => {
  res.locals.user = req.user;
  if (req.user) {
    res.locals.userIsPublisher = req.user.role === 'publisher';
    res.locals.userIsViewer = req.user.role === 'viewer';
  }
  next();
};
