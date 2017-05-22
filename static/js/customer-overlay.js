$(document).ready(function(){
    //cookie role desk cid did
    window.one = null;
    window.myorder = null;
    //get the very diet
    $.postJSON(
        '/customer-overlay',
        {},
        function(response){
            window.one = response.one;
            showContent();
        }
    );

    //event dian tapped
    $(document).on('tap', '.dian', function(){
        var demand = trim($('.demand').val());
        var ins = ['+', one.did, demand];
        $.postJSON(
            '/order',
            {'ins': json(ins)},
            function(){}
        );
    });
    //event btn-left tapped
    $(document).on('tap', '.btn-left', function(){
        window.location.replace('/customer-detail');
    });

    //event btn-right tapped
    $(document).on('tap', '.btn-right', function(){
        window.location.replace('/customer-order');
    });
    //poll
    updater.poll();
});

function showContent() {
    $('.heading').text(one.name);
    $('.picture').attr('src', '/static/pictures/'+one.picture);
    $('.desc').text(one.description);
    $('.price').text(one.price);
    $('.num').text(0);
}

function showNum(){
    if(window.myorder == null) return;
    var myorder = window.myorder;
    var orders = myorder.orders;
    var left = myorder.left;
    var doing = myorder.doing;
    var done = myorder.done;
    var all = orders.concat(left).concat(doing).concat(done);

    var did = window.one.did;
    var num = 0;
    for(var i in all) {
        if(all[i].did == did) {
            num += all[i].num;
        }
    }
    $('.num').text(num);

}
var updater = {
    interval: 800,
    stamp: 0,
    cursor: 0,
    xhr: null,
    poll: function(){

        console.log('polling', updater.cursor);
        updater.cursor += 1;
        updater.xhr = $.ajax({
            url: '/waiter-order-update',
            type: 'POST',
            dataType: 'json',
            data: {'stamp': json(updater.stamp), '_xsrf': getCookie('_xsrf')},
            success: updater.onSuccess,
            error: updater.onError
        });

    },
    onSuccess: function(response){
        window.myorder = response.myorder;
        updater.stamp = window.myorder.stamp;
        showNum();
        updater.interval = 800;
        setTimeout(updater.poll, updater.interval);
    },
    onError: function(response, error) {
        console.log(error);
        updater.interval = updater.interval*2;
        setTimeout(updater.poll, updater.interval);
    },
    reset: function(){
        updater.stamp = 0;
        updater.cursor = 0;
        updater.interval = 800;
        updater.xhr.abort();
    }
};