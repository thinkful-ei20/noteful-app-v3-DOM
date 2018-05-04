'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Note = require('../models/note');

/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {
  const {searchTerm} = req.query;   
  const filterArr = []; const regOb = {$regex: RegExp(searchTerm, 'i')};
  if (searchTerm) {
    filterArr.push({title: regOb}, {content: regOb});
  }
  Note.find(searchTerm ? {$or: filterArr} : {})
    .sort('created')
    .then(results => res.json(results))
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const searchId = req.params.id;
  if(!mongoose.Types.ObjectId.isValid(searchId)) {
    const err = new Error(`${searchId} is not a valid Id!`);
    err.status = 400;
    return next(err);
  }
  Note.findById(searchId)
    .then(result => {
      if(!result) {
        const err = new Error(`${searchId} is not a valid Id!`);
        err.status = 404;
        return next(err);
      }
      res.json(result);})
    .catch(err => next(err));
});


/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const requiredFields = ['title', 'content'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const err = new Error(`Missing \`${field}\` in request body`);
      err.status = 400;
      return next(err);
    }
  }
  const newNote = {
    title: req.body.title,
    content: req.body.content
  };
  return Note.create(newNote)
    .then(result => res.location(`${req.originalUrl}/${result.id}`).status(201).json(result))
    .catch(err => next(err));
});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const upObj = {};
  const searchId = req.params.id;
  if(!req.body.title){
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if(searchId.length!==24) {
    const err = new Error(`${searchId} is not a valid Id!`);
    err.status = 400;
    return next(err);
  }
  upObj.title = req.body.title;
  if(req.body.content) {upObj.content = req.body.content;}
  Note.findByIdAndUpdate(searchId, {$set: upObj}, {new: true})
    .then(result => {
      if(!result) {
        const err = new Error(`${searchId} is not a valid Id!`);
        err.status = 404;
        return next(err);
      }
      res.status(200).json(result);})
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;