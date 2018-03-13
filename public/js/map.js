//Coordonnées de Grenoble par défaut, pour le chargement de l'appli
var latitude = 45.1885;
var longitude = 5.7245;
var map;
var me;
var infowindow;
var icons = {
    beer: 'public/img/beer-icon2.png',
    user: 'public/img/star-eyes-emoji.png'
  };



$(document).ready(function () {
    screenHeight = $(window).height();
    $("#map").css({
        height: screenHeight
    });

    // On initialise la map seule, centrée sur les coordonnées de Grenoble par défaut
    initMap(latitude, longitude);

    //On demande l'accès à la geolocalisaton de l'utilisateur
    updateGeolocalisation();

});

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

// FONCTION D'INITIALISATION DE LA MAP
function initMap(latitude, longitude) {
    me = { lat: latitude, lng: longitude };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: me
    });
    initBars();
}

// FONCTION D'INITIALISATION DU MARKER
function initMe(latitude, longitude) {
    me = { lat: latitude, lng: longitude };
    var marker = new google.maps.Marker({
        position: me,
        map: map,
        icon: icons['user']
    });
}

// FONCTIONS DE RECHERCHE DES BARS + AFFICHAGE DES MARQUEURS CORRESPONDANT
// Requête vers l'API Google Places
function initBars() {    
    var gre = new google.maps.LatLng(45.1885, 5.7245);
    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: gre,
        radius: 1000,
        keyword: ['bar', 'Grenoble']
        // type: ['bar', 'pub']
    }, searchResults);
}

function searchResults(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarkerResults(results[i]);
            // console.log(results[i]);
        }
    }
}

function createMarkerResults(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: icons['beer']
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}



// });

// function initialize() {
//     var pyrmont = new google.maps.LatLng(-33.8665, 151.1956);

//     var map = new google.maps.Map(document.getElementById('map'), {
//       center: pyrmont,
//       zoom: 15,
//       scrollwheel: false
//     });

//     // Specify location, radius and place types for your Places API search.
//     var request = {
//       location: pyrmont,
//       radius: '500',
//       types: ['store']
//     };

//     // Create the PlaceService and send the request.
//     // Handle the callback with an anonymous function.
//     var service = new google.maps.places.PlacesService(map);
//     service.nearbySearch(request, function(results, status) {
//       if (status == google.maps.places.PlacesServiceStatus.OK) {
//         for (var i = 0; i < results.length; i++) {
//           var place = results[i];
//           // If the request succeeds, draw the place location on
//           // the map as a marker, and register an event to handle a
//           // click on the marker.
//           var marker = new google.maps.Marker({
//             map: map,
//             position: place.geometry.location
//           });
//         }
//       }
//     });
//   }

//   // Run the initialize function when the window has finished loading.
//   google.maps.event.addDomListener(window, 'load', initialize);