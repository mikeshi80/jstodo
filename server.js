var express = require("express");
var db= require("./db");
var path = require('path');

db.connect();

var app = express(
    express.logger()
);

//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');

app.set('port', 3132);

app.configure(function () {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.use(express.cookieParser('this is the secrect for me'));
    app.use(express.session());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(require('less-middleware')({src: __dirname + '/statics/styles'}));
    app.use(express.static(__dirname + '/statics'));
    app.use(app.router);
    app.locals.user = null;
});

app.on('close', function(errno) {
    db.disconnect(function(err){});
});

function authRequired(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}


app.get('/', authRequired, function(req, res) {
    db.listToDo(req.session.user._id, function(err, todoes) {
        if (err) {
            console.log('failed to list the todo, ' + err);
            res.send('list failed');
        } else {
            res.render('list.jade', {title: 'List the ToDoes for ' + req.session.user.name,
                user: req.session.user, todoes: todoes});
        }
    });
});

app.get('/add', authRequired, function(req, res) {
    res.render('add.jade');
});

app.post('/add', authRequired, function(req, res) {
    db.addToDo(req.session.user._id, req.body.content, function(err) {
        if (err) {
            console.log('Add To Do to DB failed, ' + err);
            res.redirect('/add');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/done/:id', authRequired, function(req, res) {
    db.editToDo(req.params.id, null, 'Done', function(err) {
        if (err) {
            console.log('make the todo done err, ' + err);
            res.redirect('/');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/delete/:id', authRequired, function(req, res) {
    db.deleteToDo(req.params.id, function(err) {
        if (err) {
            console.log('delete the todo failed, ' + err);
        }
        res.redirect('/');
    });
});

app.get('/register', function(req, res) {
    res.render('register.jade', {title: 'Register a new account'});
});

app.post('/register', function(req, res) {
    //res.render('test.html', {username: req.body.username, password: req.body.password});
    db.addUser(req.body.username, req.body.password, function(err, user) {
        if (err) {
            console.log('create user failed');
            res.redirect('/register');
        } else {
            res.send('Register ' + user.name + ' success, id is ' + user._id);
        }
    });
});

app.get('/login', function(req, res) {
    res.render('login.jade', {title: 'Login'});
});

app.post('/login', function(req, res) {
    db.findUserByName(req.body.username, function(err, user) {
        if (err) {
            console.log('unknown error');
            res.redirect('/login');
        } else {
            if (user==null) {
                console.log('cannot find the user by name ' + req.body.username);
                res.render('login.jade');
            } else if (user.password == req.body.password) {
                req.session.user = user;
                res.redirect('/');
            } else {
                res.send('Login failed, wrong password');
            }
        }
    });
});

app.get('/logout', authRequired, function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

app.listen(app.get('port'));

console.log('Running at ' + app.get('port') + '!!!');

