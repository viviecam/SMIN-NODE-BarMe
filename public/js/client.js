(function($){
    console.log('ouiiiiiiiiiiiiii!!!!!!!')
    // On se connecte, depuis le site, à socket io
    var socket = io.connect('http://localhost:3124');

    $('#loginform').submit(function(event){
        event.preventDefault();
        // On créé un évement sur notre socket courante, 
        // On va pouvoir envoyer cet évènement à notre serveur,
        // Avec les paramètres de notre choix
        socket.emit('login', {
            username : $('#username').val(),
            email : $('#email').val()
        });
    })


})(jQuery);