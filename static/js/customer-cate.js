$(document).ready(function(){
    //cookie role desk

    window.cate = [];

    window.myorder = {};
    //get cate
    $.postJSON(
        '/customer-cate',
        {},
        function(response){
            window.cate = response.cate;
            showCate();
        }
    );
    //event btn-exit
    $(document).on('tap', '.btn-exit', function(){
        window.location.replace('/');
    });
    //event item tapped
    $(document).on('tap', '.item', function(){
        var cid = $(this).data('cid');
        $.postJSON(
            '/customer-cate-detail',
            {'cid': json(cid)},
            function(response){
                window.location.replace(response.next);
            }
        );
    });
    //event btn-left tapped
    $(document).on('tap', '.btn-left', function(){
        $.postJSON(
            '/customer-request',
            {},
            function(response){}
        );
    });
    //event btn-right tapped
    $(document).on('tap', '.btn-right', function(){
        window.location.replace('/customer-order');
    });
    //order poll
    updater.poll();
});

function showCate(){
    if(window.cate == null) return;
    var p = $('.content').empty();
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