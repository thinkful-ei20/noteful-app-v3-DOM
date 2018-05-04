'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Note = require('../models/note');
const Folder = require('../models/folder');

router.get('/', (req, res, next) => Folder.find().sort('created')
  .then(results => res.json(results))
  .catch(err => next(err))
);

router.get('/:id', (req, res, next) => {
  const searchId = req.params.id;
  if(!mongoose.Types.ObjectId.isValid(searchId)) {
    const err = new Error(`${searchId} is not a valid Id!`);
    err.status = 400;
    return next(err);
  }
  Folder.findById(req.params.id)
    .then(result => {
      if(!result) {
        const err = new Error(`${req.params.id} is not a valid Id!`);
        err.status = 404;
        return next(err);
      }
      res.json(result);
    })
    .catch(err => next(err));
});

module.exports = router;