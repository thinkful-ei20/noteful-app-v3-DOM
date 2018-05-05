'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Tag = require('../models/tag');


// Get all tags
router.get('/', (req, res, next) => {
  Tag.find()
    .then(result => res.send(result))
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const searchId = req.params.id;
  if(!mongoose.Types.ObjectId.isValid(searchId)) {
    const err = new Error(`${searchId} is not a valid Id!`);
    err.status = 400;
    return next(err);
  }
  Tag.findById(searchId)
    .then(result => {
      if(!result) {
        const err = new Error(`${searchId} is not a valid Id!`);
        err.status = 404;
        return next(err);
      }
      res.send(result);})
    .catch(err => next(err));
});


module.exports = router;