$(document).ready(function() {
    //alert('ok');
    //get company info

    //for faculty to login
    $('div.header').on('tap', function(){


        window.location.replace('/faculty-login?hh=0');

    });

    //tap button
    $(document).on('tap', '.desk-submit', function(e){

        //<a> disabled for 5s
        if(!$(this).data('tapTime')) $(this).data('tapTime', 0);
        if (e.timeStamp < $(this).data('tapTime') + 5000) {
            e.preventDefault();
            return;
        }
        $(this).data('tapTime', e.timeStamp);
        //show tapped effect

        alert('tapped');
        //desk is string, send desk, set cookie who= desk= session=
        var desk = trim($('.desk-input').val());
        if(desk == '') return;

        transfer(desk);

    });
});


function transfer(desk){
    //alert(desk);
    desk = trim(String(desk));
    $.postJSON(
            '/',
            {'desk': json(desk)},
            function(response){
                var next = response.next;
                window.location.replace(next);
            }
        );
}