$(document).ready(function(){
    //cookie role desk cid

    window.cate = null;
    window.diet = null;
    window.myorder = null;
    window.cid = null;
    //get detail
    $.postJSON(
        '/customer-detail',
        {},
        function(response){
            window.diet = response.diet;
            window.cid = response.cid;
            buildContent();
        }
    );

    //event img tapped
    $(document).on('tap', '.picture', function(){
        var item = $(this).parent();
        $.postJSON(
            '/customer-detail-overlay',
            {'did': json(item.data('did'))},
            function(response){
                if('ok' == response.status) {
                    window.location.replace(response.next);
                }
            }
        );
    });

    //event dian tapped
    $(document).on('tap', '.dian', function(){
        var item = $(this).parent();
        var ins = ['+', item.data('did'), ''];

        $.postJSON(
            '/order',
            {'ins': json(ins)},
            function(response){}
        );

    });

    //event btn-left tapped
    $(document).on('tap', '.btn-left', function(){
        window.location.replace('/customer-cate');
    });
    //event btn-right tapped
    $(document).on('tap', '.btn-right', function(){
        window.location.replace('/customer-order');
    });
    //poll
    updater.poll();
});

function buildContent() {
    var pl = $('.left').empty();
    var pr = $('.right').empty();
    for(var i in diet) {
        if(diet[i].cid == window.cid) {
            var item = buildItem(diet[i]);

            if(pl.height() > pr.height()) {
                pr.append(item);
            } else {
                pl.append(item);
            }

        }
    }
}
function buildItem(diet){
    var item$ = $('<div class="item">'+
                        '<img src="" class="picture">'+
                        '<div class="name">宫保鸡丁</div>'+
                        '<div class="pn"><div class="price">26.0</div><div class="num">0</div></div>'+
                        '<a class="dian">来一份</a>'+
                    '</div>');
    item$.data(diet);
    item$.find('.picture').attr('src', '/static/pictures/'+ diet.picture);
    item$.find('.name').text(diet.name);
    item$.find('.price').text(diet.price);
    item$.find('.num').text(0);
    return item$;
}
function showNum(){
    if(window.myorder == null) return;
    var myorder = window.myorder;
    var orders = myorder.orders;
    var left = myorder.left;
    var doing = myorder.doing;
    var done = myorder.done;
    var all = orders.concat(left).concat(doing).concat(done);
    $('.item').each(function(){
        var did = $(this).data('did');
        var num = 0;
        for(var i in all) {
            if(all[i].did == did) {
                num += all[i].num;
            }
        }
        $(this).find('.num').text(num);
    });
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