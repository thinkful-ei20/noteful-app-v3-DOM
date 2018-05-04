'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Folders', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Folder.insertMany(seedFolders);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/folders', function () {

    it('should return the correct number of Folders', function () {
      return Promise.all([
        Folder.find(),
        chai.request(app).get('/api/folders')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list with the correct right fields', function () {
      return Promise.all([
        Folder.find(),
        chai.request(app).get('/api/folders')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item) {
            expect(item).to.be.a('object');
            expect(item).to.have.keys('name', 'id', 'createdAt', 'updatedAt');
          });
        });
    });

    describe('GET /api/folders/:id', function () {

      it('should return correct folder', function () {
        let data;
        return Folder.findOne()
          .then(_data => {
            data = _data;
            return chai.request(app).get(`/api/folders/${data.id}`);
          })
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
  
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
  
            expect(res.body.id).to.equal(data.id);
            expect(res.body.title).to.equal(data.title);
            expect(res.body.content).to.equal(data.content);
          });
      });
  
      it('should respond with a 400 for improperly formatted id', function () {
        const badId = '99-99-99';
  
        return chai.request(app)
          .get(`/api/notes/${badId}`)
          .then(res => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.eq(`${badId} is not a valid Id!`);
          });
      });
  
      it('should respond with a 404 for an invalid id', function () {
  
        return chai.request(app)
          .get('/api/notes/AAAAAAAAAAAAAAAAAAAAAAAA')
          .then(res => {
            expect(res).to.have.status(404);
          });
      });
  
    });
  });
});