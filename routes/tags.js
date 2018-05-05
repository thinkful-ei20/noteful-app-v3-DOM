'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Tag = require('../models/tag');
const Note = require('../models/note');

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
    .catch(err => {
      if(err.code === 11000){
        err = new Error('This tag already exists by that name');
        err.status = 400;
      }
      next(err);});
});

router.post('/', (req, res, next) => {
  if (!req.body.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  const newTag = { name: req.body.name };
  return Tag.create(newTag)
    .then(result => res.location(`${req.originalUrl}/${result.id}`).status(201).json(result))
    .catch(err => next(err));
});

router.put('/:id', (req, res, next) => {
  const upObj = {};
  const searchId = req.params.id;
  if(!req.body.name){
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  if(searchId && !mongoose.Types.ObjectId.isValid(searchId)) {
    const err = new Error(`${searchId} is not a valid Id!`);
    err.status = 400;
    return next(err);
  }
  upObj.name = req.body.name;
  Tag.findByIdAndUpdate(searchId, {$set: upObj}, {new: true})
    .then(result => {
      if(!result) {
        const err = new Error(`${searchId} is not a valid Id!`);
        err.status = 404;
        return next(err);
      }
      res.status(200).json(result);})
    .catch(err => {
      if(err.code === 11000){
        err = new Error('This tag already exists by that name');
        err.status = 400;
      }
      next(err);});
});

router.delete('/:id', (req, res, next) => {
  const removeTag = Tag.findByIdAndRemove(req.params.id);
  const removeTagFromNote = Note.updateMany({tags: req.params.id}, {'$pull': {'tags': req.params.id}});
  Promise.all([removeTag, removeTagFromNote])
    .then(() => res.status(204).end())
    .catch(err => next(err));
});


module.exports = router;