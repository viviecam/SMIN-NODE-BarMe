var ejs = require('ejs');
var express = require('express');
var app = express();
var serverBarMe = require('http').Server(app);


// Set the view engine to ejs
app.set('view engine', 'ejs');
// On déclare où est notre répertoire static
app.use('/public', express.static('public'));

// Gestion des urls et des template ejs
app.get('/login', function (req, res) {
    res.render('login.ejs');
})

app.get('/loginNmap', function(req, res) {
    res.render('map.ejs');
})

app.use(function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Not Found');
});


// On déclare que le serveur écoute sur le port 3123
serverBarMe.listen(3123);



// On lie socket au server, on lui dit d'ecouter les connexions au niveau de notre serveur
var io = require('socket.io').listen(serverBarMe);

/********** VARIABLES GLOBALES **********/

/***** MAP *****/
// Coordonnées du centre de la map
// Par défaut, sur Grenoble, pour le chargement de l'appli
var centerMap = { lat: 45.1885, lng: 5.7245 };

// Stockage local des resultats de la recherche
var localResults = {};
// Icons pour les markers
var icons = {
    beer: 'public/img/beer-icon2.png',
    user: 'public/img/emoji.png'
};
// Stockage local des prix des bars => Pour garantir la persistence des données
var localBeerPrices = {};


/***** CHAT *****/
// Variable pour stocker les utilisateurs connectés
var users = {};
// Variable pour stocker les messages
var messages = [];
var history = 2;


// Quand il y a une connexion sur l'une des sockets = Quand un utilisateur ouvre la page
// Fonction qui prend en paramètre, la socket de l'utilisateur en cours
io.sockets.on('connection', function (socket) {

    /***** MAP *****/

    // On emet un évènement pour initialiser la carte, 
    // en passant en paramètre les coordonnées du centre par défaut
    socket.emit('initMap', centerMap);

    // On initialise les bars sur la carte
    // On définie la zone sur Grenoble
    var greLoc = {
        latitude: 45.1885,
        longitude: 5.7245
    }
    // On emet un evenement pour initiliser les bars
    socket.emit('initBars', greLoc);

    // Quand les resultats ont bien été chargés
    socket.on('resultsLoaded', function (results) {
        // On stocke localement chaque résultat, pour pouvoir modifier les prix par la suite
        for (var i = 0; i < results.length; i++) {
            // On vient copier le resultat courant dans notre variable localResults
            // En l'indexant, non pas avec i, mais avec l'id du bar
            // pour permettre le changement de prix par la suite, en se basant sur l'id du bar
            localResults[results[i].id] = results[i]           
        }

        // PERSISTENCE DES DONNEES DE PRIX
        // Pour chaque bar dont le prix à déjà été changé par un autre utilisateur qui s'est connecté avant
        // On va aller rajouter la valeur du prix, dans notre stockage local des resultats
        // pour le bar correspondant
        for (var k in localBeerPrices) {
            localResults[k].beerPrice = localBeerPrices[k]
        }

        // Pour chaque bar dans notre stockage local des resultats, auquel on vient de rajouter les prix
        // On va emettre l'évenenement 'displayBar', qui va déclencher l'affichage du marker du bar courant
        // Avec tous ses paramètres, y compris son prix, s'il à été ajouté 
        for (var j in localResults) {
            // On passe donc en paramètre le bar courant avec tous ses paramètres, et la liste des icones
            socket.emit('displayBar', localResults[j], icons);
        }


    });

    // Quand un prix de bière est changé par un utilisateur
    socket.on('modifyprice', function (currentBar) {
        // On stocke localement le nouveau prix pour le bar courant
        // Pour garantir la persistence des données si un nouvel utilisateur se connecte après le changement
        localBeerPrices[currentBar.barId] = currentBar.newBeerPrice;

        // On l'ajoute aussi à notre stockage local des bars
        // Pour que la nouvelle valeur du prix soit bien stockée (et affichée) pour l'utilisateur courant
        localResults[currentBar.barId].beerPrice = currentBar.newBeerPrice;

        // On emet l'évènement 'displayBar' à tous les utilisateurs
        // qui va regénérer le marker et la bulle d'info du bar courant
        // avec ses nouveaux paramètres, et donc son nouveau prix
        // + la liste des icons
        io.sockets.emit('displayBar', localResults[currentBar.barId], icons)

        // Enfin, on emet un évènement pour dire que le prix à changé, en envoyant le bar courant et son nouveau prix
        // On l'envoit à tous les utilisateur, car cela permet de changer visuellement le prix, si les autres users
        // ont la bulle d'info du même bar, ouverte en même temps que l'utilisateur qui à changé le prix
        io.sockets.emit('pricehaschanged', currentBar);
    });


    // Si géolocalisation
    socket.on('geolocUser', function (latitudeGeo, longitudeGeo) {
        // On récupère les coordonnées de l'utilisateur, que l'on stocke dans notre variable pour centrer la carte
        var userGeo = { lat: latitudeGeo, lng: longitudeGeo };
        // On relance l'init de la map avec le nouveau centre, sur l'utilisateur
        socket.emit('initMap', userGeo)
        // On relance l'init des bars 
        socket.emit('initBars', greLoc)
        // On emet un evènement 'displayUser' pour afficher le marker de l'user
        // On lui envoie les coordonnées de l'user, et la liste des icones
        socket.emit('displayUser', userGeo, icons);
    });


    /***** CHAT *****/

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
    socket.on('login', function (user) {
        // On récupère l'user qui vient de se connecter
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
    socket.on('disconnect', function () {
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
    socket.on('newmsgarrived', function (message) {
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



})
