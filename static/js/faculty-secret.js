$(document).ready(function(){
    $('.btn-submit').on('tap', function(e){
        //disable for 5s
        if(!$(this).data('tapTime')) $(this).data('tapTime', 0);
        if (e.timeStamp < $(this).data('tapTime') + 5000) {
            e.preventDefault();
            return;
        }
        $(this).data('tapTime', e.timeStamp);
        //show tapped effect

        var old = trim($('#old-password').val());
        var password1 = trim($('#password1').val());
        var password2 = trim($('#password2').val());
        if(old == '' || password1 == '' || password2 == '') return;
        if(password1 != password2) {
            $('.msg').hide();
            $('#input-error').show();
        } else {
            $.postJSON(
                '/faculty-secret',
                {'old': json(old), 'password': json(password1)},
                function(response){
                    console.log(response);
                    if(response.status == 'ok') {
                        $('.msg').hide();
                        $('#success').show();
                    } else {
                        $('.msg').hide();
                        $('#failure').show();
                    }

                }
            );
        }

    });

    $('.btn-back').on('tap', function(){
        window.location.replace('/faculty-home');
    });
});