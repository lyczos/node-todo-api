const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todosMock = [
    {
        _id: new ObjectID(),
        text: 'First todo'
    },
    {
        _id: new ObjectID(),
        text: 'Second todo'
    }];


beforeEach(done => {
   Todo.remove({}).then(() => {
      return Todo.insertMany(todosMock);
   }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', done => {
        var text = 'test todo test';
        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text);
            })
            .end((err,res) => {
                if (err)
                   return done(err);

                Todo.find({text}).then(todos => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(e => done(e));
            });
    });

    it('should not create TODO with invaild body data', done => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err)
                    return done(err);

                Todo.find().then(todos => {
                    expect(todos.length).toBe(todosMock.length);
                    done();
                }).catch(e => done(e));
            })
    })
});

describe('GET /todos', () => {
    it('should get all todos', done => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect( res => {
                expect(res.body.todos.length).toBe(todosMock.length);
            })
            .end(done);
    })
});


describe('GET /todos/:id', () => {
    it('should return DOC by id', done => {
        request(app)
            .get(`/todos/${todosMock[0]._id.toHexString()}`)
            .expect(200)
            .expect( res => {
                expect(res.body.todo.text).toBe(todosMock[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', done => {
        var id = new ObjectID();
        request(app)
            .get(`/todos/${id.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if ID is invalid (non-object id)', done => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    })
});

describe('DELETE /todos/:id', () => {
   it('should delete doc by id', done => {
       var id = todosMock[0]._id.toHexString();
       request(app)
           .delete(`/todos/${id}`)
           .expect(200)
           .expect(res => {
               expect(res.body.todo._id).toBe(id);
           })
           .end( (err, res) => {
               if (err)
                   return done(err);

               Todo.findById(id).then(todo => {
                   expect(todo).toBeFalsy();
                   done();
               }).catch(e => done(e));
           });
   });

    it('should return 404 if todo not found', done => {
        var id = new ObjectID();
        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

   it('should return 404 if objectId is invalid', done => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);
   })
});