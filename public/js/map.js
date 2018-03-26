/********** VARIABLES GLOBALES **********/
// Map
var map;
// Bulle d'info sur les bars
var infowindow;


// On se connecte, depuis notre site, à socket io
var socket = io.connect('http://localhost:3123');

$(document).ready(function () {
    // On définie la taille de la carte, en fonction de la taille de la fenêtre
    screenHeight = $(window).height();
    $("#map").css({
        height: screenHeight
    });

    // Quand l'évènement 'initMap' à lieu 
    // (cf serveur : à l'ouverture d'une page par un user, event 'connection')
    socket.on('initMap', function initMap(center) {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: center
        });
    })

    // Quand l'évènement 'initBars' à lieu 
    // (cf serveur : à l'ouverture d'une page par un user, event 'connection')
    socket.on('initBars', function initBars(greLoc) {
        // On initialise le lieu pour la recherche (grenoble), envoyé depuis le serveur
        var gre = new google.maps.LatLng(greLoc.latitude, greLoc.longitude);
        // On initialise les bulles d'infos
        infowindow = new google.maps.InfoWindow();
        // On effectue la recherche, avec nos paramètres, 
        // Via une requête dans l'API Google Places
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: gre,
            radius: 1000,
            keyword: ['bar', 'Grenoble']
        }, sendResults);
        // Un fois la recherche effectuée, on appelle en callback la fonction sendResults
        function sendResults(results, status) {
            // Si le statut de la réponse est ok
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // On emet un évenement 'resultsLoaded' et on transmet les résultats au serveur
                socket.emit('resultsLoaded', results);
            }
        }
    });

    // Quand l'évènement 'displayBar' à lieu 
    // (cf serveur : une fois que les resultats on été chargés, event 'resultsLoaded')
    // Cet évènement est donc généré pour chaque résultats
    socket.on('displayBar', function displayBar(place, icons) {
        // On affiche le marker correspondant au bar courant
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: icons['beer']
        });

        // Génération de la bulle d'info, au click sur le marker
        google.maps.event.addListener(marker, 'click', function () {
            // On vérifie si le prix de la bière dans le bar courant, est défini ou non
            if (place.beerPrice === undefined) {
                // On change son contenu seulement pour l'affichage
                place.beerPrice = 'Prix non renseigné';
            }
            infowindow.setContent(
                '<div id="' + place.id + '"><h5><strong>' + place.name + '</strong></h5>' +
                '<p>' + place.vicinity + '<br>' +
                '<h6>Pinte de bière : <span class="badge badge-info">' + place.beerPrice + '</span></h6></p>'
                + '<p><br> <i>Vous êtes sur place ? Le prix n\'est pas le bon?</i> </p>'
                + '<form id="changebeerprice" class="form-inline">'
                + '<input type="number" step=".01" class="form-control form-control-sm mr-sm-2" id="beerprice" placeholder="Entrer le nouveau prix">'
                + '<input type="submit" value="Modifier le prix" class="btn btn-sm btn-warning"/>'
                + '</form></div>');

            infowindow.open(map, this);


            // Quand l'utilisateur soumet le formulaire de changement de prix de la bière
            $("#changebeerprice").submit(function (e) {
                // $("#changebeerprice > button").click(function(event) {
                e.preventDefault();
                // On emet un évenement "modifyprice" et on passe en paramètres
                // le nouveau prix et l'id du bar
                socket.emit('modifyprice', {
                    barId: place.id,
                    newBeerPrice: $('#beerprice').val() + ' €'
                });
                // On vide le input après avoir envoyé la valeur entrée par l'utilisateur
                $('#changebeerprice input[type=number]').val('');
            });

            // Quand l'évenement "pricehaschanged" a lieu
            socket.on('pricehaschanged', function pricehaschanged(bar) {
                // On modifie visuellement le prix dans la bulle d'info
                $('#' + bar.barId + ' span').empty();
                $('#' + bar.barId + ' span').html(bar.newBeerPrice);
            });

        });

    });




    // Si l'utilisateur nous à donné accès à sa localisation
    if (navigator.geolocation) {
        // On récupère les coordonnées de l'utilisateur
        navigator.geolocation.getCurrentPosition(function geoloc(position) {
            var latitudeGeo = position.coords.latitude;
            var longitudeGeo = position.coords.longitude;
            // On emet un évènement 'geolocUser' en envoyant les paramètres de latitude et de longitude
            socket.emit('geolocUser', latitudeGeo, longitudeGeo);
        });
    }

    socket.on('displayUser', function displayUser(user, icons) {
        var marker = new google.maps.Marker({
            position: user,
            map: map,
            icon: icons['user']
        })
    });

});


// FONCTION D'AFFICHAGE DE LA CONNECTION
function logyou() {
    console.log('voila');
    $("#logyou").show();
}

// FONCTION D'AFFICHAGE DU CHAT
function afficheChat() {
    $(".container.lechat").show();
}
