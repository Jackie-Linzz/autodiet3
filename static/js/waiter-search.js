$(document).ready(function(){
    //cookie role desk

    //get diet
    window.diet = null;
    window.myorder = null;
    window.search = null;
    $.postJSON(
        '/waiter-search',
        {},
        function(response) {
            window.diet = response.diet;
        }
    );
    //event back
    $(document).on('tap', '.heading', function(){
        window.location.replace('/waiter-cate');
    });
    //event search
    $(document).on('change', '.input', function(){
        var did = trim($('.input').val());
        did = Number(did);
        window.search = [];
        for(var i in window.diet){
            if(window.diet[i].did == did) window.search.push(diet[i]);
        }
        showContent();

    });

    //event add
    $(document).on('tap', '.button', function(){
        var item = $(this).parents('.item');
        var did = item.data('did');
        var demand = trim(item.find('.demand').val());
        var ins = ['+', did, demand];

        $.postJSON(
            '/order',
            {'ins': json(ins)},
            function(){}
        );
    });

    //poll
    updater.poll();
});

function showContent(){
    if(window.search == null ) return;
    var search = window.search;
    var p = $('.results').empty();
    for(var i in search) {
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

        item.data(search[i]);
        item.find('.name').text(search[i].name);
        item.find('.price').text(search[i].price);
        item.find('.num').text(0);
        p.append(item);
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