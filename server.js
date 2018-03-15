var ejs = require('ejs');
var express = require('express');
var app = express();
var serverBarMe = require('http').Server(app);


// Set the view engine to ejs
app.set('view engine', 'ejs');
// On déclare où est notre répertoire static
app.use('/public', express.static('public'));

// Gestion des urls et des template ejs
app.get('/login', function(req, res) {
    res.render('login.ejs');
})

app.get('/map', function(req, res) {
    res.render('map.ejs');
})

app.use(function(req, res){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Not Found');
});


// On déclare que le serveur écoute sur le port 3124
serverBarMe.listen(3123);



// On lie socket au server, on lui dit d'ecouter les connexions au niveau de notre serveur
var io = require('socket.io').listen(serverBarMe);
// Variable pour stocker les utilisateurs connectés
var users = {};
// Variable pour stocker les messages
var messages = [];
var history = 2;

// Quand il y a une connexion sur l'une des sockets = Quand un utilisateur ouvre la page
io.sockets.on('connection', function (socket) {
    // Fonction qui prend en paramètre, la socket de l'utilisateur en cours
    // console.log('Un nouvel utilisateur à ouvert la page');

    // Pour tous les utilisateurs déjà connectés et existant dans users
    // On emet l'évenement "newuser", qui va généré leur ajout visuellement dans la liste, coté client
    for (var k in users) {
        socket.emit('newuser', users[k]);
    }

    // Pour tous les messages déjà existants
    for (var k in messages) {
        socket.emit('newmsgtodisplay', messages[k]);
    }

    // On créer une variable currentUser pour pouvoir utiliser l'user ailleurs
    var currentUser = false;

    // Quand un utilisateur se connecte
    socket.on('login', function(user){
        // On récupère l'user qui vient de se connecter
        // console.log(user);
        currentUser = user;
        currentUser.id = user.email;

        // On emet un évenement pour dire que l'utilisateur est bien connecté
        socket.emit('logged');

        // On rajoute l'user courrant dans la liste des users
        users[currentUser.id] = currentUser;
        // Broadcast permet de "prevenir" tous les socket connectés (tous les users) que l'évenement à eu lieu,
        // Sauf la socket courante :
        //socket.broadcast.emit('newuser');
        // Pour prévenir tout le monde, y compris la socket courante
        // io.sockets, car il recence tout les users actuellement connectés
        io.sockets.emit('newuser', currentUser);
    });

    // Quand l'utilisateur se déconnecte / quitte la page
    socket.on('disconnect', function(){
        // Pour être sur qu'un user ne puisse pas se deconnecter sans s'être préalablement connecté
        // Si je n'ai pas encore d'user dans mon currentUser (car l'user ne s'est pas encore connecté)
        if (!currentUser) {
            return false;
        }
        // On le supprime de la liste des users
        delete users[currentUser.id];
        // Et on emet un évenement pour prevenir tout le monde qu'un user s'est déconnecté
        io.sockets.emit('disconnectuser', currentUser);
    });

    // Quand un message arrive
    socket.on('newmsgarrived', function(message){
        message.user = currentUser;
        date = new Date();
        message.hour = date.getHours();
        message.min = date.getMinutes();
        message.day = date.getDate();
        message.month = date.getMonth() + 1;
        message.year = date.getFullYear();
        // On verifie que le tableau de message ne soit pas plein pour ajouter le nouveau message au tableau
        if (messages.length > history) {
            // Shift permet de supprimer le premier element du tableau
            messages.shift();
        }
        messages.push(message);
        io.sockets.emit('newmsgtodisplay', message);
    });

    
    // MAP 

    var currentBar = {};

    // Quand un prix de bière est changé
    socket.on('modifyprice', function(price){
        // // On récupère le prix qui vient d'être modifié 
        currentBar = price;
        
        // = {
        //     price.barId : price.beerPrice
        // }
        // currentUser.id = user.email;
        console.log(currentBar)

        // On emet un évenement à tous les users pour dire que le prix à changé
        io.sockets.emit('pricehaschanged', currentBar);

        // // On rajoute l'user courrant dans la liste des users
        // users[currentUser.id] = currentUser;
        // // Broadcast permet de "prevenir" tous les socket connectés (tous les users) que l'évenement à eu lieu,
        // // Sauf la socket courante :
        // //socket.broadcast.emit('newuser');
        // // Pour prévenir tout le monde, y compris la socket courante
        // // io.sockets, car il recence tout les users actuellement connectés
        // io.sockets.emit('newuser', currentUser);
    });

})
