var express = require('express')
var crypto = require('crypto')
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
io.on('connection', function(socket) {
    console.log('Client connected');
});
http.listen(3000, function() {
    console.log('Socket listening on port 3000.');
});

var mysql = require('mysql')
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'korpus'
})

connection.connect();

app.get('/api/getDevices', function(req, res) {
    var token = req.query.token
    connection.query("SELECT name1 FROM devices WHERE device2_secret='" + token + "';", function(error, results, fields) {
        if (error) throw error
        res.send(results)
    })
})

app.get('/api/getControllers', function(req, res) {
    var token = req.query.token
    connection.query("SELECT name2 FROM devices WHERE device1_secret='" + token + "';", function(error, results, fields) {
        if (error) throw error
        res.send(results)
    })
})

app.get('/api/addDevice', function(req, res) {
    var key = req.query.key
    var name = req.query.name
    var token = crypto.randomBytes(64).toString('hex')
    if(req.query.token !== undefined) {
        token = req.query.token
    }
    connection.query("INSERT INTO devices (pair_key, device1_secret, name1) VALUES ('" + key + "','" + token + "', '" + name + "');", function(error, results, fields) {
        if (error) throw error
        res.send({
            'status': 'ok',
            'token': token
        })
    })
})

app.get('/api/setDevice', function(req, res) {
    var key = req.query.key
    var name = req.query.name
    var token = crypto.randomBytes(64).toString('hex')
    connection.query("UPDATE devices SET device2_secret='" + token + "',pair_key='',name2='" + name + "' WHERE pair_key='" + key + "';", function(error, results, fields) {
        if (error) throw error
        io.emit('setdevice')
        res.send({
            'status': 'ok',
            'token': token
        })
    })
})

app.get('/api/commands/shutdown', function(req, res) {
    var name = req.query.name
    var token = req.query.token
    connection.query("SELECT name1,device1_secret FROM devices WHERE device2_secret='" + token + "';", function(error, results, fields) {
        if (error) throw error
        for (let i = 0; i < results.length; i++) {
            if (results[i].name1 === name) {
                io.emit('command', {
                    command: 'shutdown',
                    token: results[i].device1_secret
                })
                res.send({
                    'status': 'ok'
                })
            }
        }
    })
})

app.get('/api/commands/sleep', function(req, res) {
    var name = req.query.name
    var token = req.query.token
    connection.query("SELECT name1,device1_secret FROM devices WHERE device2_secret='" + token + "';", function(error, results, fields) {
        if (error) throw error
        for (let i = 0; i < results.length; i++) {
            if (results[i].name1 === name) {
                io.emit('command', {
                    command: 'sleep',
                    token: results[i].device1_secret
                })
                res.send({
                    'status': 'ok'
                })
            }
        }
    })
})

app.listen(2448, function() {
    console.log('App listening on port 2448!')
})
