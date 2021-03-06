require('./config/config');

const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const MODEL_PATH = './models/';
const DB_PATH = './db/';

var {mongoose} = require(DB_PATH + 'mongoose');
var {Todo} = require(MODEL_PATH + 'todo');
var {User} = require(MODEL_PATH + 'user');

var app = express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
        // console.log(JSON.stringify(doc, undefined, 2));
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then(
        todos => res.send({todos}),
        e => res.status(400).send(e)
    );
});


app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send({});
    }

    Todo.findById(id).then(
        todo => {
            if (!todo)
                return res.status(404).send();

            res.send({todo})
        }
    ).catch(e => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then(
        todo => {
            if (!todo)
                return res.status(404).send();

            res.send({todo});
        }
    ).catch(e => res.status(400).send());

});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    })
});


app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};