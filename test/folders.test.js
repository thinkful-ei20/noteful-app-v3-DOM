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
            expect(res.body.name).to.equal(data.name);
          });
      });
  
      it('should respond with a 400 for improperly formatted id', function () {
        const badId = '99-99-99';
  
        return chai.request(app)
          .get(`/api/folders/${badId}`)
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

  describe('POST /api/folders', function () {

    it('should create and return a new folder when provided valid data', function () {
      const newItem = {
        'name': 'Spoof Folder',
      };
      let res;
      return chai.request(app)
        .post('/api/folders')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          return Folder.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.name).to.equal(data.name);
          expect(res.body.id).to.equal(data.id);
        });
    });

    it('should return an error when posting an object with a missing "name" field', function () {
      const newItem = {
        'bogusName': 'Some Bogus Folder'
      };

      return chai.request(app)
        .post('/api/folders')
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

  });

  describe('PUT /api/folders/:id', function () {

    it('should update the folder when provided proper valid data', function () {
      const updateItem = {
        'name': 'A Better Title'
      };
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/folders/${data.id}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateItem.name);
        });
    });


    it('should respond with a 400 for improperly formatted id', function () {
      const updateItem = {
        'name': 'On a hope and prayer'
      };
      const badId = '99-99-99';

      return chai.request(app)
        .put(`/api/folders/${badId}`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq(`${badId} is not a valid Id!`);
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      const updateItem = {
        'name': 'But I thought I Made It'
      };

      return chai.request(app)
        .put('/api/folders/AAAAAAAAAAAAAAAAAAAAAAAA')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when missing "name" field', function () {
      const updateItem = {
        'foo': 'bar'
      };

      return chai.request(app)
        .put('/api/folders/9999')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

  });

  describe('DELETE  /api/folders/:id', function () {

    it('should delete an item by id', function () {
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
        });
    });

  });
});