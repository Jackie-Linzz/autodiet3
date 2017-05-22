$(document).ready(function(){
    //$('#faculty-login').removeClass('ui-page-theme-a');
    //$('#faculty-login').find('*').attr('data-role', 'none');
    //cookie uid
    // send id and password, get who and fid, set cookie
    $('.btn-submit').on('tap', function(e){
        //disable for 5s
        if(!$(this).data('tapTime')) $(this).data('tapTime', 0);
        if (e.timeStamp < $(this).data('tapTime') + 5000) {
            e.preventDefault();
            return;
        }
        $(this).data('tapTime', e.timeStamp);
        //show tapped effect

        var fid = trim($('#fid').val());
        var password = trim($('#password').val());
        if(fid == '' || password == '') return;
        $.postJSON(
            '/faculty-login',
            {'fid': json(fid), 'password': json(password)},
            function(response){
                console.log(response);
                if(response.status != 'ok') return;
                window.location.replace(response.next);
            }
        );
    });
});