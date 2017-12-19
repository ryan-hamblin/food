const mongoose = require('mongoose');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const expect = chai.expect;
chai.use(chaiHTTP);
mongoose.connect('mongodb://localhost/food-test', { useMongoClient: true });

const server = require('./server');
const Food = require('./food');

describe(`food api`, () => {
  let foodId = '';
  beforeEach(done => {
    const newFood = new Food({ title: 'Spaghetti' });
    newFood.save((err, savedFood) => {
      if (err) {
        done();
      }
      foodId = savedFood._id;
      done();
    });
  });

  afterEach(done => {
    Food.remove({}, err => {
      if (err) {
        done();
      }
      done();
    });
  });

  describe(`[POST] '/food'`, () => {
    it('should add a food item to the food DB and handles an error with bad input data', done => {
      const foodToSave = {
        fda: 'Chicken Nuggets'
      };
      chai
        .request(server)
        .post('/food')
        .send(foodToSave)
        .end((err, res) => {
          if (err) {
            expect(err.response.body.err).to.equal(
              'Food validation failed: title: Path `title` is required.'
            );
            expect(err.status).to.equal(422);
            done();
          }
          expect(res.body).to.be.an('object');
          expect(res.status).to.equal(200);
          expect(res.body.title).to.equal(foodToSave.title);
          expect(res.body).to.haveOwnProperty('_id');
          done();
        });
    });
  });

  describe(`[GET] '/food'`, () => {
    it('should return array of objects', done => {
      chai
        .request(server)
        .get('/food')
        .end((err, res) => {
          if (err) {
            expect(err.status).to.equal(500);
            done();
          }
          expect(res.status).to.equal(200);
          expect(Array.isArray(res.body)).to.equal(true);
          expect(res.body.length).to.equal(1);
          expect(res.body[0]).to.be.an('object');
          expect(foodId.toString()).to.equal(res.body[0]._id);
          done();
        });
    });
  });

  describe(`[DELETE] '/food/:id'`, () => {
    it('should delete an item from the DB', done => {
      chai
        .request(server)
        .delete(`/food/${foodId}`)
        .end((err, response) => {
          if (err) {
            expect(err.status).to.equal(422);
            done();
          }
          expect(response.text).to.equal('success');
          // do own delete to Food in here. Food.remove({foodId}, (err, removedObj) => {})
        });
    });
  });
});
