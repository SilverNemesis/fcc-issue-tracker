/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http')
var chai = require('chai')
var assert = chai.assert
var server = require('../server')

chai.use(chaiHttp)

let id1
let id2

suite('Functional Tests', function () {

  suite('POST /api/issues/{project} => object with issue data', function () {

    test('Every field filled in', function (done) {
      const issue_title = 'Title'
      const issue_text = 'text'
      const created_by = 'Functional Test - Every field filled in'
      const assigned_to = 'Chai and Mocha'
      const status_text = 'In QA'
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text
        })
        .end(function (err, res) {
          if (err) {
            assert.fail(err)
          }
          assert.equal(res.status, 200)
          assert.equal(res.body.issue_title, issue_title)
          assert.equal(res.body.issue_text, issue_text)
          assert.equal(res.body.created_by, created_by)
          assert.equal(res.body.assigned_to, assigned_to)
          assert.equal(res.body.status_text, status_text)
          assert.isDefined(res.body.created_on)
          assert.isDefined(res.body.updated_on)
          assert.isDefined(res.body.open)
          assert.isDefined(res.body._id)
          id1 = res.body._id
          done()
        })
    })

    test('Required fields filled in', function (done) {
      const issue_title = 'Title 2'
      const issue_text = 'text'
      const created_by = 'Functional Test - Required fields filled in'
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title,
          issue_text,
          created_by
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.issue_title, issue_title)
          assert.equal(res.body.issue_text, issue_text)
          assert.equal(res.body.created_by, created_by)
          assert.equal(res.body.assigned_to, '')
          assert.equal(res.body.status_text, '')
          assert.isDefined(res.body.created_on)
          assert.isDefined(res.body.updated_on)
          assert.isDefined(res.body.open)
          id2 = res.body._id
          done()
        })
    })

    test('Missing required fields', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function (err, res) {
          assert.equal(res.status, 400)
          done()
        })
    })

  })

  suite('PUT /api/issues/{project} => text', function () {

    test('No body', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: id1 })
        .end(function (err, res) {
          assert.equal(res.status, 400)
          assert.equal(res.text, 'no updated field sent')
          done()
        })
    })

    test('One field to update', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: id1, issue_text: 'updated issue text test' })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.text, 'successfully updated')
          done()
        })
    })

    test('Multiple fields to update', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: id2, issue_text: 'updated issue text test for the second issue', open: 'false' })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.text, 'successfully updated')
          done()
        })
    })

  })

  suite('GET /api/issues/{project} => Array of objects with issue data', function () {

    test('No filter', function (done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          assert.property(res.body[0], 'issue_title')
          assert.property(res.body[0], 'issue_text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'updated_on')
          assert.property(res.body[0], 'created_by')
          assert.property(res.body[0], 'assigned_to')
          assert.property(res.body[0], 'open')
          assert.property(res.body[0], 'status_text')
          assert.property(res.body[0], '_id')
          done()
        })
    })

    test('One filter', function (done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ assigned_to: 'Chai and Mocha' })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.property(res.body[0], 'issue_title')
          assert.property(res.body[0], 'issue_text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'updated_on')
          assert.property(res.body[0], 'created_by')
          assert.property(res.body[0], 'assigned_to')
          assert.property(res.body[0], 'open')
          assert.property(res.body[0], 'status_text')
          assert.property(res.body[0], '_id')
          assert.equal(res.body[0].assigned_to, 'Chai and Mocha')
          done()
        })
    })

    test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ open: false })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.property(res.body[0], 'issue_title')
          assert.property(res.body[0], 'issue_text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'updated_on')
          assert.property(res.body[0], 'created_by')
          assert.property(res.body[0], 'assigned_to')
          assert.property(res.body[0], 'open')
          assert.property(res.body[0], 'status_text')
          assert.property(res.body[0], '_id')
          assert.equal(res.body[0].open, false)
          assert.equal(res.body[0].issue_title, 'Title 2')
          done()
        })
    })

  })

  suite('DELETE /api/issues/{project} => text', function () {

    test('No _id', function (done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 400)
          assert.equal(res.text, '_id error')
          done()
        })
    })

    test('Valid _id', function (done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: id2 })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.text, 'deleted ' + id2)
          done()
        })
    })

  })

})
