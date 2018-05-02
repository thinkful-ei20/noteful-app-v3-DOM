'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { MONGODB_URI } = require('../config');
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
  Note.findById(searchId)
    .then(result => {res.json(result);})
    .catch(err => next(err));
});


/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const requiredFields = ['title', 'content'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      return res.status(400).send(message);
    }
  }
  const newNote = {
    title: req.body.title,
    content: req.body.content
  };
  return Note.create(newNote)
    .then(result => res.status(201).json(result))
    .catch(err => next(err));
});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const upObj = {};
  if(req.body.title) {upObj.title = req.body.title;}
  if(req.body.content) {upObj.content = req.body.content;}
  Note.findByIdAndUpdate(req.params.id, {$set: upObj}, {new: true})
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;