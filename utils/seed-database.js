'use strict';
// Requires mongoose
const mongoose = require('mongoose');

// Gets mongodb(uri) from config file
const { MONGODB_URI } = require('../config');

// Gets schema from Note model
const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');

// Gets seed database
const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(seedNotes),
      Folder.insertMany(seedFolders),
      Tag.insertMany(seedTags),
      Folder.createIndexes(),
      Tag.createIndexes()
    ]);
  })
  .then(results => {
    console.info(`Inserted ${results[0].length} Notes`);
    console.info(`Inserted ${results[1].length} Folders`);
    console.info(`Inserted ${results[2].length} Tags`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });