$(document).ready(function(){
    //cookie: role= fid= session=

    //button work tapped
    $('.btn-work').on('tap', function(){
        $.postJSON(
            '/faculty-home',
            {'screenWidth': json(window.screen.width)},
            function(response){
                window.location.replace(response.next);
            }
        );
    });
    //button setting tapped
    $('.btn-info').on('tap', function(){
        window.location.replace('/faculty-secret');
    });
    //button logout tapped
    $('.btn-logout').on('tap', function(){
        $.postJSON(
            '/faculty-logout',
            {},
            function(response){
                window.location.replace(response.next);
            }
        );
    });
});