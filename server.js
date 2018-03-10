// var http = require('http');
// var url = require('url');

// serverBarNme = http.createServer(function(req,res) {
    
// });
var ejs = require('ejs');
var express = require('express');
var app = express();
var serverBarMe = require('http').Server(app);

// Gestion des urls et des template ejs
app.get('/login', function(req, res) {
    res.render('login.ejs');
})

app.use(function(req, res){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Not Found');
});

// On déclare où est notre répertoire static
app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, '/public')));
// app.use(express.static(__dirname + '/public'));
// app.use('/public', express.static(path.join(__dirname, 'public')))

// On déclare que le serveur écoute sur le port 3124
serverBarMe.listen(3124);

// On lie socket au server
var io = require('socket.io').listen(serverBarMe);

// Quand il y a une connexion sur le serveur, sur l'une des sockets 
io.sockets.on('connection', function (socket) {
    // On réceptionne l'évènement
    socket.on('login', function(user){
        console.log(user);
    })

})