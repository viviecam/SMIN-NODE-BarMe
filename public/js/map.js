$(document).ready(function () {
    screenHeight = $(window).height();
    $("#map").css({
        height: screenHeight
    });

    //Coordonnées de Grenoble par défaut
    var latitude = 45.1885;
    var longitude = 5.7245;

    initMap(latitude, longitude);
    
    //On demande l'accès à la geolocalisaton de l'utilisateur
    updateGeolocalisation();

});

function updateGeolocalisation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            console.log('geoloc');
            longitude = position.coords.longitude;
            latitude = position.coords.latitude;
            initMap(latitude, longitude);
        });
    }
}


function initMap(latitude, longitude) {

    var me = { lat: latitude, lng: longitude };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: me
    });
    var marker = new google.maps.Marker({
        position: me,
        map: map
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