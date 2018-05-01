'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');

// Get all notes or get note by searchTerm
mongoose.connect(MONGODB_URI)
  .then(() => {
    // change to req.body.searchTerm
    const searchTerm = 'aliquam';   
    const filterArr = [{}, {}];
    if(searchTerm){
      filterArr[0].title = { $regex: RegExp(searchTerm, 'i') };
      filterArr[1].content = { $regex: RegExp(searchTerm, 'i') };
    }

    return Note.find({$or: filterArr})
      .sort('created')
      .then(results => console.log(results))
      .catch(console.error);
  })
  .then(() => {
    return mongoose.disconnect()
      .then(() => { console.info('Disconnected');});
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// Get note by id (endpoint 'api/notes/:id')
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     // change to req.params.id
//     const searchId = '000000000000000000000006';
//     return Note.findById(searchId)
//       .then(result => console.log(result))
//       .catch(console.error)
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => console.info('Disconnected'));
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Create a note
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     // Replace with validation of fields from req.body
//     const newNote = {
//       title: 'Working on a 2GB Budget',
//       content: 'Blank...you cannot work on that type of budget'
//     };
//     return Note.create(newNote)
//       .then(result => console.log(result))
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => console.info('Disconnected'));
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Find and update name
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     // Replace with req.params.id
//     const searchId = '5ae8c6e816556df3542295b7';
//     // Replace with req.body
//     const upObj = {
//       title: 'To Be or Not To Be on Windows',
//       content: 'Go Linux. Mac is started to piss me off.'
//     };
//     return Note.findByIdAndUpdate(searchId, {$set: upObj}, {new: true})
//       .then(result => console.log(result))
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => console.info('Disconnected'));
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     // Replace with req.params.id
//     const searchId = '5ae8ca1e6e63ecf3f505afa6';
//     return Note.findByIdAndRemove(searchId)
//       .then(() => console.log('Note deleted'))
//       .catch(console.error);
//   })
//   .then(() => mongoose.disconnect().then(() => console.info('Disconnected')))
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

