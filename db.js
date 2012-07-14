var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var dburl = "mongodb://localhost:27017/jstodo";
exports.connect = function () {
    mongoose.connect(dburl);
}

exports.disconnect = function (callback) {
    mongoose.disconnect(callback);
}

exports.setup = function (callback) {
    callback(null);
}

var UserSchema = new Schema({
    name: String,
    password: String
});

var User = mongoose.model('User', UserSchema);

var ToDoSchema = new Schema({
    user_id: ObjectId,
    content: String,
    status: {
        type: String,
        enum: ['Done', 'Active'],
    default:
        'Active'
    }
});

var ToDo = mongoose.model('ToDo', ToDoSchema);

exports.listToDo = function (user_id, callback) {
    ToDo.find({
        user_id: user_id
    }, callback);
};

exports.addToDo = function (user_id, content, callback) {
    var newToDo = new ToDo();
    newToDo.user_id = user_id;
    newToDo.content = content;
    newToDo.save(function (err) {
        if (err) {
            console.log('add ToDo failed, ' + err);
            callback(err);
        }
        else {
            callback(null);
        }
    });
};

exports.getToDoById = function (id, callback) {
    ToDo.findOne({_id:id}, callback);
};

exports.getToDoByStatus = function(user_id, status, callback) {
    ToDo.find({user_id:user_id, status: status}, callback);
};

exports.editToDo = function(id, content, status, callback) {
    exports.getToDoById(id, function(err, todo) {
        if (err) {
            console.log('Error when find the ToDo by id to edit');
            callback(err);
        } else {
            if (content !== null) {
                todo.content = content;
            }
            if (status !== null) {
                todo.status = status;
            }
            todo.save(function(err) {
                if (err) {
                    console.log('Error when save the edited ToDo record, ' + err);
                    callback(err);
                } else
                    callback(null);
            });
        }
    });
};

exports.deleteToDo = function(id, callback) {
    exports.getToDoById(id, function(err, todo) {
        if (err) {
            console.log('Error when find thd ToDo by id to delete');
            callback(err);
        } else {
            todo.remove();
            callback(null);
        }
    });
};

exports.addUser = function(username, password, callback) {
    var user = new User();
    user.name = username;
    user.password = password;
    user.save(function(err) {
        if (err) {
            console.log('save user info failed');
            callback(err, null);
        } else {
            callback(null, user);
        }
    });
};

exports.findUserByName = function(username, callback) {
    User.findOne({name: username}, callback);
};

