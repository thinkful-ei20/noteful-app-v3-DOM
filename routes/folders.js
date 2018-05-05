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
  if(searchId && !mongoose.Types.ObjectId.isValid(searchId)) {
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

router.post('/', (req, res, next) => {
  if (!('name' in req.body)) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  const newFolder = {
    name: req.body.name
  };
  return Folder.create(newFolder)
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
  Folder.findByIdAndUpdate(searchId, {$set: upObj}, {new: true})
    .then(result => {
      if(!result) {
        const err = new Error(`${searchId} is not a valid Id!`);
        err.status = 404;
        return next(err);
      }
      res.status(200).json(result);})
    .catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
  const removeFolder = Folder.findByIdAndRemove(req.params.id);
  const removeFolderFromNote = Note.updateMany({folderId: req.params.id}, {'$unset': {'folderId': null}});
  Promise.all([removeFolder, removeFolderFromNote])
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;