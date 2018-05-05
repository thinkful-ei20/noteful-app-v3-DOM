'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


const Note = require('../models/note');

/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {
  const {searchTerm, folderId, tagId} = req.query;   
  const filterArr = []; const filterObj = {}; const regOb = {$regex: RegExp(searchTerm, 'i')};
  if (searchTerm) {
    filterArr.push({title: regOb}, {content: regOb});
  }
  if (folderId) {
    filterObj.folderId = folderId;
  }
  if (tagId) {
    filterObj.tagId = tagId;
  }
  Note.find(searchTerm ? {$or: filterArr} : filterObj ? filterObj : {})
    .populate('tags')
    .sort({'updatedAt': 'desc'})
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
    .populate('tags')
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
  const {tags=[]} = req.body;
  const requiredFields = ['title', 'content'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const err = new Error(`Missing \`${field}\` in request body`);
      err.status = 400;
      return next(err);
    }
  }
  if (tags) {
    tags.forEach(tag => {
      if(!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('The `id` is not a valid one');
        err.status = 400;
        next(err);
      }
    });
  }
  const newNote = {
    title: req.body.title, content: req.body.content,
    folderId: req.body.folderId, tags
  };
  return Note.create(newNote)
    .then(result => res.location(`${req.originalUrl}/${result.id}`).status(201).json(result))
    .catch(err => next(err));
});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const upObj = {};
  const {tags=[]} = req.body;
  const searchId = req.params.id;
  if(!req.body.title){
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if (tags) {
    tags.forEach(tag => {
      if(!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('The `id` is not a valid one');
        err.status = 400;
        next(err);
      }
    });
  }
  if(searchId && !mongoose.Types.ObjectId.isValid(searchId)) {
    const err = new Error(`${searchId} is not a valid Id!`);
    err.status = 400;
    return next(err);
  }
  upObj.title = req.body.title;
  upObj.tags = tags;
  if(req.body.content) {upObj.content = req.body.content;}
  if(req.body.folderId) {upObj.folderId = req.body.folderId;}
  Note.findByIdAndUpdate(searchId, {$set: upObj}, {new: true})
    .populate('tags')
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