'use strict';
// Requires mongoose
const mongoose = require('mongoose');

// Gets mongodb(uri) from config file
const { MONGODB_URI } = require('../config');

// Gets schema from Note model
const Note = require('../models/note');

// Gets seed database
const seedNotes = require('../db/seed/notes');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => Note.insertMany(seedNotes))
  .then(results => {
    console.info(`Inserted ${results.length} Notes`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });