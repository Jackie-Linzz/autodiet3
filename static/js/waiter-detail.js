$(document).ready(function(){
    //secure cookie: role=  fid=   cookie: desk cid
    window.diet = null;
    window.myorder = null;
    window.desk = null;
    window.cid = null;

    $.postJSON(
        '/waiter-detail',
        {},
        function(response){
            window.diet = response.diet;
            window.myorder = response.myorder;
            window.desk = response.desk;
            window.cid = response.cid;
            showDiet();

        }
    );

    //button + event
    $(document).on('tap', '.button', function(){
        var p = $(this).parents('.item');
        var did = p.data('did');
        var demand = trim(p.find('.demand').val());
        var ins = ['+', did, demand];
        $.postJSON(
            '/order',
            {'ins': json(ins)},
            function(response){}
        );
    });
    //footer left button
    $(document).on('tap', '.btn-left', function(){
        window.location.replace('/waiter-cate');
    });
    //footer right button
    $(document).on('tap', '.btn-right', function(){
        window.location.replace('/waiter-order');
    });
    //poll
    updater.poll();
});

function showDiet(){
    if(window.diet == null) return;
    var d = window.diet;
    var p = $('.content').empty();
    for(var i in d) {
        if(d[i]['cid'] == window.cid) {
            var item = $('<div class="item">'+
                            '<div class="row">'+
                                '<div class="name">空爆鸡丁</div>'+
                                '<div class="pn"> <div class="price">26.0</div><div class="num">0</div> </div>'+
                            '</div>'+
                            '<div class="row">'+
                                '<input type="text" class="demand" />'+
                                '<a class="button">+</a>'+
                                '<div class="clear"></div>'+
                            '</div>'+
                        '</div>');
            item.data(d[i]);
            item.find('.name').text(d[i].name);
            item.find('.price').text(d[i].price);
            item.find('.num').text('0');
            p.append(item);
        }
    }
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