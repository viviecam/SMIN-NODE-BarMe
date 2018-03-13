// Coordonnées de Grenoble par défaut, pour le chargement de l'appli
var latitude = 45.1885;
var longitude = 5.7245;
// Map
var map;
// Coordonnées de géolocalisation de l'utilisateur
var me;
// Bulle d'info sur les bars
var infowindow;
// Markers
var icons = {
    beer: 'public/img/beer-icon2.png',
    user: 'public/img/star-eyes-emoji.png'
  };


// Une fois que la page est chargée
$(document).ready(function () {
    // On définie la taille de la carte, en fonction de la taille de la fenêtre
    screenHeight = $(window).height();
    $("#map").css({
        height: screenHeight
    });

    // On initialise la map seule, centrée sur les coordonnées de Grenoble par défaut
    initMap(latitude, longitude);

    //On demande l'accès à la geolocalisaton de l'utilisateur
    updateGeolocalisation();

});

// FONCTION D'INITIALISATION DE LA MAP
function initMap(latitude, longitude) {
    me = { lat: latitude, lng: longitude };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: me
    });
    // On charge ensuite les bars
    initBars();
}

//FONCTION DE GEOLOCALISATION
function updateGeolocalisation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            // On récupère les coordonnées de l'utilisateur
            longitude = position.coords.longitude;
            latitude = position.coords.latitude;
            // On recharge la map (pour la recentrer sur les nouveaux coordonnées)
            initMap(latitude, longitude);
            // Et on charge le marqueur
            initMe(latitude, longitude);
        });
    }
}

// FONCTION D'INITIALISATION DU MARKER DE GEOLOCALISATION
function initMe(latitude, longitude) {
    me = { lat: latitude, lng: longitude };
    var marker = new google.maps.Marker({
        position: me,
        map: map,
        icon: icons['user']
    });
}

// FONCTIONS DE RECHERCHE DES BARS + AFFICHAGE DES MARQUEURS CORRESPONDANT
function initBars() {    
    // On définie la zone sur Grenoble
    var gre = new google.maps.LatLng(45.1885, 5.7245);
    // On initialise les bulles d'infos
    infowindow = new google.maps.InfoWindow();
    // Requête vers l'API Google Place
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: gre,
        radius: 1000,
        keyword: ['bar', 'Grenoble']
        // type: ['bar', 'pub']
    }, searchResultsLoop);
}
// Boucle sur les résultats de la recherche
function searchResultsLoop(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            // On initialise le prix de la pinte de bière
            results[i].beerPrice = '';
            // Appel à la fonction pour créer un marker pour chaque bar trouvé
            createMarkerResults(results[i]);
            console.log(results[i]);
        }
    }
}
// Création des markers des bars
function createMarkerResults(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: icons['beer']
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent('<div><p><strong>' + place.name + '</strong><br>' +
        place.vicinity  + "<br>" +
        "Prix de la pinte de bière : " + place.beerPrice 
        + "<br><br> <i>Vous êtes sur place ? Le prix n'est pas le bon?</i> <br> <button type=\"button\" class=\"btn btn-sm btn-warning\">Modifier le prix</button></p></div>");
        // infowindow.setContent(place.beerPrice);
        infowindow.open(map, this);
    });
}