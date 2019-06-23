'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const mongo = require('mongodb')
const CONNECTION_STRING = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fcc'

const apiRoutes = require('./routes/api.js')
const fccTestingRoutes = require('./routes/fcctesting.js')
const runner = require('./test-runner')

const app = express()

app.use('/public', express.static(process.cwd() + '/public'))

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(helmet.xssFilter())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html')
  })

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html')
  })

//For FCC testing purposes
fccTestingRoutes(app)

const serveApplication = (app, client) => {
  //Routing for API
  apiRoutes(app, client)

  //404 Not Found Middleware
  app.use(function (req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found')
  })

  //Start our server and tests!
  const port = process.env.PORT || 3000
  app.listen(port, function () {
    console.log('Listening for connections at http://localhost:' + port)
    if (process.argv[2] === 'test') {
      console.log('Running Tests...')
      setTimeout(function () {
        try {
          runner.run()
        } catch (e) {
          console.log('Tests are not valid:')
          console.log(e)
        }
      }, 3500)
    }
  })
}

if (process.argv[2] === 'test') {
  const client = new mongo.MongoClient('mongodb://127.0.0.1:27017/fcc_test', { useNewUrlParser: true })

  client.connect()
    .then(() => {
      const db = client.db()
      db.collection('issues')
        .drop(function (err, success) {
          serveApplication(app, client)
        })
    }, (err) => {
      console.log(err)
    })
} else {
  const client = new mongo.MongoClient(CONNECTION_STRING, { useNewUrlParser: true })

  client.connect()
    .then(() => {
      serveApplication(app, client)
    }, (err) => {
      console.log(err)
    })
}

module.exports = app; //for testing
