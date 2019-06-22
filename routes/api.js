/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'

const mongo = require('mongodb')

module.exports = function (app, client) {
  const db = client.db()

  app.route('/api/issues/:project')

    // I can GET    /api/issues/{projectname} for an array of all issues on that specific project with all the information for each issue as was returned when posted.
    .get(function (req, res) {
      const project = req.params.project
      const searchQuery = req.query
      if (searchQuery._id) {
        searchQuery._id = new mongo.ObjectId(searchQuery._id)
      }
      if (searchQuery.open) {
        searchQuery.open = String(searchQuery.open) == "true"
      }
      searchQuery.project = project
      db.collection('issues')
        .find(searchQuery, { projection: { issue_title: true, issue_text: true, created_by: true, assigned_to: true, status_text: true, created_on: true, updated_on: true, open: true } })
        .toArray((err, issues) => {
          if (err) {
            console.log(err)
            res.status(500).json({ message: JSON.stringify(err) })
          } else {
            res.json(issues)
          }
        })
    })

    // I can POST   /api/issues/{projectname} with form data containing required issue_title, issue_text, created_by, and optional assigned_to and status_text.
    //   The object saved (and returned) will include all of those fields (blank for optional no input) and also include created_on(date/time), updated_on(date/time), open(boolean, true for open, false for closed), and _id.
    .post(function (req, res) {
      const project = req.params.project
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body
      const now = new Date()
      const insertData = {
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: now,
        updated_on: now,
        open: true
      }
      if (project && issue_title && issue_text && created_by) {
        db.collection('issues').insertOne(insertData)
          .then((data) => {
            res.json(Object.assign({}, insertData, { _id: data.insertedId }))
          })
          .catch((err) => {
            console.log(err)
            res.status(500).json({ message: JSON.stringify(err) })
          })
      } else {
        res.status(400).json({ message: 'required fields missing' })
      }
    })

    // I can PUT    /api/issues/{projectname} with a _id and any fields in the object with a value to object said object. Returned will be 'successfully updated' or 'could not update '+_id. This should always update updated_on. If no fields are sent return 'no updated field sent'.
    .put(function (req, res) {
      if (req.body._id) {
        if (req.body.open) {
          req.body.open = String(req.body.open) == "true"
        }

        let updatesPresent = false
        const updates = {}
        for (let prop in req.body) {
          if (req.body.hasOwnProperty(prop)) {
            if (prop !== '_id') {
              updatesPresent = true
              updates[prop] = req.body[prop]
            }
          }
        }

        if (updatesPresent) {
          updates.updated_on = new Date()
          db.collection('issues').findOneAndUpdate({ _id: new mongo.ObjectId(req.body._id) }, { $set: updates }, { returnNewDocument: true }, function (err, doc) {
            if (err) {
              res.send('could not update ' + issue + ' ' + err)
            } else {
              res.send('successfully updated')
            }
          })
        } else {
          res.status(400).send('no updated field sent')
        }
      } else {
        res.status(400).send('_id error')
      }
    })

    // I can DELETE /api/issues/{projectname} with a _id to completely delete an issue. If no _id is sent return '_id error', success: 'deleted '+_id, failed: 'could not delete '+_id.
    .delete(function (req, res) {
      const issue = req.body._id
      if (issue) {
        db.collection('issues').findOneAndDelete({ _id: new mongo.ObjectId(issue) }, function (err, doc) {
          if (err) {
            res.send('could not delete ' + issue + ' ' + err)
          } else {
            res.send('deleted ' + issue)
          }
        })
      } else {
        res.status(400).send('_id error')
      }
    })

}
