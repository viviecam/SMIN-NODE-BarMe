$(document).ready(function () {
    // On se connecte, depuis notre site, à socket io
    var socket = io.connect('http://localhost:3123');

    // Quand l'utilisateur soumet le formulaire de login
    $('#loginform').submit(function(event){
        event.preventDefault();
        // On génère un évenement "login" et on passe en paramètre,
        // les infos de l'user qui vient de se connecter
        socket.emit('login', {
            username : $('#username').val(),
            email : $('#email').val()
        });
    });

    // Quand l'utilisateur est connecté, on fait disparaitre le formulaire de login
    socket.on('logged', function(){
        $('.login-overlay').fadeOut();
        $('#messageinput').focus();
    });

    /** GESTION DES USERS CONNECTES **/

    // Quand l'évenement "newuser" a lieu
    socket.on('newuser', function(user){
        //alert('Voila il y a un nouvel utilisateur!');
        $('#users').append('<li id = "'+ user.id +'">' + user.username + ' : ' + user.email + '</li>');
    });

    // Quand un utilisateur se déconnecte
    socket.on('disconnectuser', function(user) {
        $('#' + user.id).remove();
    });

    /** ENVOI DE MESSAGES **/
    //On stocke le template fait en html, en js
    var msgtpl = $('#msgtpl').html();
    // Puis on le supprime de l'html après l'avoir récupéré en js
    $('#msgtpl').remove();

    // Pour récupérer l'id de l'user qui a envoyé le dernier msg
    var lastmsg = false;

    // Quand l'utilisateur soumet un nouveau message
    $('#msgform').submit(function(event){
        event.preventDefault();
        console.log($('#messageinput').val());
        socket.emit('newmsgarrived', {message: $('#messageinput').val()});
        $('#messageinput').val('');
        $('#messageinput').focus();
    });

    // Quand un nouveau message arrive et doit être affiché
    socket.on('newmsgtodisplay', function(message) {
        if (lastmsg != message.user.id) {
            $('#msglist').append('<hr>');
            lastmsg = message.user.id;
        }
        $('#msglist').append('<li>' + Mustache.render(msgtpl, message) + '</li>');
        $('#msglist').animate({scrollTop : $('#msglist').prop('scrollHeight')}, 50);
    });

});