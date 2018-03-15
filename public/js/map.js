// Coordonnées de Grenoble par défaut, pour le chargement de l'appli
var latitude = 45.1885;
var longitude = 5.7245;
// Map
var map;
// Coordonnées de géolocalisation de l'utilisateur
var me;
// Stockage local des resultats de la recherche
var localResults = {};
// Bulle d'info sur les bars
var infowindow;
// Markers
var icons = {
    beer: 'public/img/beer-icon2.png',
    user: 'public/img/emoji.png'
};


// On se connecte, depuis notre site, à socket io
var socket = io.connect('http://localhost:3123');

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
        // localResults = results;
        // console.log(localResults);
        for (var i = 0; i < results.length; i++) {
            //On stocke dans une variable local, les résultats, pour pouvoir changer le prix de la bière
            localResults[results[i].id] = results[i];
            // On initialise le prix de la pinte de bière
            localResults[results[i].id].beerPrice = '3';
            // Appel à la fonction pour créer un marker pour chaque bar trouvé
            createMarkerResults(localResults[results[i].id]);
            // console.log(results[i]);
            // console.log(localResults[i]);
        }
        console.log(localResults);
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

    // Génération de la bulle d'info
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(
            '<div id="' + place.id + '"><h5><strong>' + place.name + '</strong></h5>' +
            '<p>' + place.vicinity + '<br>' +
            '<h6>Pinte de bière : <span class="badge badge-info">' + place.beerPrice + ' €</span></h6></p>'
            // + "<br><br> <i>Vous êtes sur place ? Le prix n'est pas le bon?</i> <br> <button type=\"button\" class=\"btn btn-sm btn-warning\"  data-toggle=\"modal\" data-target=\"#modalchangeprice-" + 
            + '<p><br> <i>Vous êtes sur place ? Le prix n\'est pas le bon?</i> </p>'
            + '<form id="changebeerprice" class="form-inline">'
            + '<input type="number" step=".01" class="form-control form-control-sm mr-sm-2" id="beerprice" placeholder="Entrer le nouveau prix">'
            // + '<button class="btn btn-sm btn-warning">Modifier le prix</button>'
            + '<input type="submit" value="Modifier le prix" class="btn btn-sm btn-warning"/>'
            // <input type="submit" value="Join chat" class="btn btn-primary form-control">
            // + '<button type="button" class="btn btn-sm btn-warning" data-toggle="modal" data-target="#modalchangeprice">Modifier le prix</button>'
            + '</form></div>');
        infowindow.open(map, this);

        // SOCKET IO POUR CHANGER LE PRIX D'UNE PINTE DE BIERE
        // Quand l'utilisateur soumet le formulaire de changement de prix de la bière
        $("#changebeerprice").submit(function (e) {
            // $("#changebeerprice > button").click(function(event) {
            e.preventDefault();
            // On génère un évenement "login" et on passe en paramètre,
            // les infos de l'user qui vient de se connecter
            socket.emit('modifyprice', {
                barId: place.id,
                newBeerPrice: $('#beerprice').val()
            });
            // alert(place.id);
        });

        // Quand l'évenement "pricehaschanged" a lieu
        socket.on('pricehaschanged', function (bar) {
            alert('Le prix à changé!');
            // On va chercher, dans notre tableau de résultats local, le bar dont on souhaite modifier le prix
            // bar.barId
            // Et on modifie sa propriété beerPrice, en affectant la nouvelle valeur bar.newBeerPrice
            localResults[bar.barId].beerPrice = bar.newBeerPrice;
            console.log(localResults[bar.barId]);
            // Et on modifie visuellement le prix dans la bulle d'info
            $('#' + bar.barId + ' span').empty();
            $('#' + bar.barId + ' span').html(bar.newBeerPrice + ' €');
        });

        // $('body').append('<div class="modal" tabindex="-1" role="dialog" id="modalchangeprice-' + place.id + ' ">' +
        // $('body').append('<div class="modal" tabindex="-1" role="dialog" id="modalchangeprice">' +
        //     '<div class="modal-dialog" role="document">' +
        //     '<div class="modal-content">' +
        //     '<div class="modal-header">' +
        //     '<h5 class="modal-title" id="text">Changer le prix de la pinte de bière chez ' + place.name + ' </h5>' +
        //     // '<button id="closemodal" type="button" class="close" data-dismiss="modal" aria-label="Close">' +
        //     '<button id="closemodal" type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="removeModal()">' +
        //     '<span aria-hidden="true">&times;</span>' +
        //     '</button>' +
        //     '</div>' +
        //     '<form id="changebeerprice">' +
        //     '<div class="modal-body">' +
        //     '<input type="email" class="form-control" id="beerprice" placeholder="Entrer le nouveau prix">' +
        //     '</div>' +
        //     '<div class="modal-footer">' +
        //     '<button type="submit" class="btn btn-primary">Enregister</button>' +
        //     '</div>' +
        //     '</form>' +
        //     '</div>' +
        //     '</div>' +
        //     '</div>');

        // $('.modal-backdrop, #closemodal').click(function () {
        //     $('#modalchangeprice').remove();
        //     $('.modal-backdrop').remove();
        //     console.log('ok');
        // });

        // function removeModal() {
        //     $('#modalchangeprice').remove();
        //     // $('.modal-backdrop').remove();
        //     console.log('ok');
        // };

        // }

    });

}


// MODALE DE CHANGEMENT DE PRIX DE LA PINTE DE BIERE
// $('#changebeerprice').on('shown.bs.modal', function () {
//     $('#beerprice').trigger('focus')
// })

