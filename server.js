var express = require("express");
var db= require("./db");

db.connect();

var app = express(
    express.logger()
);

//app.engine('.html', require('jade').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.configure(function () {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.use(express.cookieParser('this is the secrect for me'));
    app.use(express.session());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});

app.on('close', function(errno) {
    db.disconnect(function(err){});
});

app.get('/', function(req, res) {
    db.addToDo('mike', 'node demo', function(err) {
        if(err) {console.log('error to add, ' + err);}
    });
    res.send('Hello world');
});

app.get('/register', function(req, res) {
    res.render('register.jade');
});

app.post('/register', function(req, res) {
    //res.render('test.html', {username: req.body.username, password: req.body.password});
    db.addUser(req.body.username, req.body.password, function(err, user) {
        if (err) {
            console.log('create user failed');
        } else {
            res.send('Register ' + user.name + ' success, id is ' + user._id);
        }
    });
});

app.get('/login', function(req, res) {
    res.render('login.jade');
});

app.post('/login', function(req, res) {
    db.findUserByName(req.body.username, function(err, user) {
        if (err) {
            console.log('unknown error');
            res.render('login.jade');
        } else {
            if (user==null) {
                console.log('cannot find the user by name ' + req.body.username);
                res.render('login.jade');
            } else if (user.password == req.body.password) {
                req.session.user = user;
                res.send('Login successfully with user name ' + req.body.username);
            } else {
                res.send('Login failed, wrong password');
            }
        }
    });
});

app.listen(3132);

console.log('Running!!!');

