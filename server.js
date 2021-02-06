//A simple server for pushing index.html to localhost
//Without this, metamask wont connect
//node server.js to start serving

var express = require('express');
var app = express();
var path = require('path');

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/index.html'));
});
app.get('/index.css', function(req, res) {
    res.sendFile(__dirname + "/" + "frontend/index.css");
});
app.get('/dictionary.json', function(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/dictionary.json'));
});
app.get('/poems.json', function(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/poems.json'));
});

app.listen(8080);
console.log("listening on port 8080");