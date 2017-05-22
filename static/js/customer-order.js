$(document).ready(function(){
    //cookie role desk

    window.myorder = null;
    //get myorder

    //event btn-history tapped
    $(document).on('tap', '.btn-history', function(){
        window.location.replace('/customer-history');
    });
    //event item button cancle tapped
    $(document).on('tap', '.button', function(){
        var item = $(this).parents('.item');
        var uid = item.data('uid');
        var ins = ['-', uid];
        $.postJSON(
            '/order',
            {'ins': json(ins)},
            function(){}
        );
    });
    //event feedback tapped
    $(document).on('tap', '.feedback', function(){
        window.location.replace('/customer-feedback');
    });
    //event btn-left tapped
    $(document).on('tap', '.btn-left', function(){
        window.location.replace('/customer-cate');
    });
    //event btn-right tapped
    $(document).on('tap', '.btn-right', function(){
        var ins = ['submit'];
        $.postJSON(
            '/order',
            {'ins': json(ins)},
            function(response){
                window.myorder = response.myorder;
                showOrder();
            }
        );
    });
    //poll
    updater.poll();
});

function Item(data) {
    var item$ = $('<div class="item">'+
                        '<div class="row">'+
                            '<div class="name">空爆鸡丁</div>'+
                            '<div class="pn"> <div class="price">26.0</div><div class="num">0</div> </div>'+
                        '</div>'+
                        '<div class="row">'+
                            '<input type="text" class="demand" />'+
                            '<a class="button">X</a>'+
                            '<div class="clear"></div>'+
                        '</div>'+
                   ' </div>');
    item$.data(data);
    item$.find('.name').text(data.name);
    item$.find('.price').text(data.price);
    item$.find('.num').text(data.num);
    item$.find('.demand').val(data.demand);
    return item$;
}
function showOrder() {
    var myorder = window.myorder;
    //gdemand
    var gdemand = myorder.gdemand;
    $('.gdemand').val(gdemand);

    var p = $('.items').empty();
    var total = 0;
    var num = 0;

    //done
    var done = myorder.done;
    for(var i in done) {
        var item = Item(done[i]);
        item.find('.name').text(item.data('name')+'(已做)');
        total += item.data('price') * item.data('num');
        num += item.data('num');
        p.append(item);
    }
    //doing
    var doing = myorder.doing;
    for(i in doing) {
        var item = Item(doing[i]);
        item.find('.name').text(item.data('name')+'(正在做)');
        total += item.data('price') * item.data('num');
        num += item.data('num');
        p.append(item);
    }
    //left
    var left = myorder.left;
    for(i in left) {
        var item = Item(left[i]);
        item.find('.name').text(item.data('name')+'(待做)');
        total += item.data('price') * item.data('num');
        num += item.data('num');
        p.append(item);
    }
    //orders
    var orders = myorder.orders;
    for(i in orders) {
        var item = Item(orders[i]);
        item.find('.name').text(item.data('name')+'(未下单)');
        total += item.data('price') * item.data('num');
        num += item.data('num');
        p.append(item);
    }
    //total
    $('.total').find('.price').text(total);
    $('.total').find('.num').text(num);
    //btn-right
    var status = myorder.status;
    if(status == 'none') {
        $('.btn-right').text('下单');
    } else if(status == 'ready') {
        $('.btn-right').text('请再次确认');
    } else if(status == 'lock'){
        $('.btn-right').text('已锁定');
    } else if(status == 'submitted') {
        $('.btn-right').text('已下单');
    }
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
        showOrder();
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