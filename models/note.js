'use strict';

const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: String,
  createdAt: Date,
  updatedAt: Date
});

noteSchema.set('toObject', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;