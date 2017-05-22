$(document).ready(function(){
    //cookie: role=  fid=   cookie: desk
    window.cate = [];

    window.myorder = {};
    window.desk = null;


    //if desk cookie exists, show content, else hide
    window.desk = getCookie('desk');
    if(desk == null) {
        state_out();
    } else {

        $('.heading').text(desk);
        state_in();
    }

    //get cate and diet;
    $.postJSON(
        '/waiter-cate',
        {},
        function(response){
            window.cate = response.cate;

            showCate();
        }
    );

    //btn-input event
    $('#btn-input').on('tap', function(){

        var desk = trim($('input.input').val());
        if (desk == '') return;

        $.postJSON(
            '/waiter-cate-login',
            {'desk': json(desk)},
            function(response) {
                window.myorder = response.myorder;
                window.desk = desk;
                $('.heading').text(desk);
                state_in();
                showNum();
            }
        );

    });

    //btn-exit event
    $('.btn-exit').on('tap', function(){
        $.postJSON(
            '/waiter-cate-logout',
            {},
            function(response){
                window.myorder = null;
                window.desk = null;
                state_out();
            }
        );
        updater.reset();
    });

    //btn-search event
    $('.btn-search').on('tap', function(){
        window.location.replace('/waiter-search');
    });


    //btn-left event
    $('.btn-left').on('tap', function(){
        window.location.replace('/waiter-request');
    });
    //btn-right event
    $('.btn-right').on('tap', function(){
        window.location.replace('/waiter-order');
    });
    //item tap event
    $(document).on('tap', '.item', function(){
        var cid = $(this).data('cid');
        $.postJSON(
            '/waiter-cate-detail',
            {'cid': json(cid)},
            function(response){
                window.location.replace(response.next);
            }
        );
    });
});

function state_in(){
    $('.div-input').hide();
    $('.menu').show();
    $('.header').show();
    $('.btn-right').show();
}
function state_out(){
    $('.div-input').show();
    $('.menu').hide();
    $('.header').hide();
    $('.btn-right').hide();
}

function showCate(){
    if(window.cate == null) return;
    var p = $('.menu').empty();
    var cate = window.cate;

    for(var i in cate) {
        var item = $('<div class="item">'+
                            '<div class="name">主食</div>'+
                            '<div class="num">0</div>'+
                        '</div>');
        item.data(cate[i]);
        item.find('.name').text(cate[i].name);
        p.append(item);
    }


}

function showNum() {
    if(window.myorder == {}) return;
    var left = myorder.left;
    var doing = myorder.doing;
    var done = myorder.done;
    var orders = myorder.orders;
    var all = left.concat(doing).concat(done).concat(orders);
    $('.item').each(function(){
        var cid = $(this).cid;
        var total = 0;
        for(var i in all){
            if(cid == all[i].cid) total += all[i].num;
        }
        $(this).find('.num').text(total);
    });
}

var updater = {
    interval: 800,
    stamp: 0,
    cursor: 0,
    xhr: null,
    poll: function(){
        if(!window.desk) {
            console.log('waiting');
            setTimeout(updater.poll, updater.interval);
            return;
        }
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