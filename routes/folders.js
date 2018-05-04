'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Note = require('../models/note');
const Folder = require('../models/folder');

router.get('/', (req, res, next) => {
  Folder.find()
    .sort('created')
    .then(results => res.json(results))
    .catch(console.error);
});

module.exports = router;