$(document).ready(function(){
    // cookie: role desk
    window.packs = null;
    //get packs
    $.postJSON(
        '/waiter-history',
        {},
        function(response){
            window.packs = response.packs;
            showContent();
        }
    );
    //event back
    $(document).on('tap', '.btn-left', function(){
        window.location.replace('/waiter-order');
    });
});

function showContent(){
    var packs = window.packs;
    var p = $('.content').empty();
    for(var i in packs) {
        var pack = packs[i];
        var puid = pack.puid;
        var gdemand = pack.gdemand;
        var submit = pack.submit;
        var pay = pack.pay;
        var bill = pack.bill;
        var orders = pack.orders;

        var pack$ = $('<div class="pack">'+
                            '<div class="time">2016年4月22日</div>'+
                            '<textarea class="gdemand"></textarea>'+
                            '<div class="items">'+
                                '<div class="item">'+
                                    '<div class="row">'+
                                        '<div class="name">空爆鸡丁</div>'+
                                        '<div class="pn"> <div class="price">26.0</div><div class="num">0</div> </div>'+
                                    '</div>'+
                                    '<div class="row">'+
                                        '<input type="text" class="demand" />'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="total item">'+
                                '<div class="row">'+
                                    '<div class="name">总共</div>'+
                                    '<div class="pn"> <div class="price">26.0</div><div class="num">0</div> </div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="status">已付款</div>'+
                        '</div>');
        pack$.find('.time').text(submit);
        pack$.find('.gdemand').val(gdemand);


        var status$ = pack$.find('.status');
        if(pay) {
            status$.text('已付款');
        } else {
            status$.text('未付款');
        }
        var items$ = pack$.find('.items').empty();

        var total = 0;
        var num = 0;
        for(var j in orders) {
            var order = orders[j];
            num += order.num;
            total += order.price * order.num;
            var item$ = $('<div class="item">'+
                                '<div class="row">'+
                                    '<div class="name">空爆鸡丁</div>'+
                                    '<div class="pn"> <div class="price">26.0</div><div class="num">0</div> </div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<input type="text" class="demand" />'+
                                '</div>'+
                            '</div>');
            item$.find('.name').text(order.name);
            item$.find('.price').text(order.price);
            item$.find('.num').text(order.num);
            item$.find('.demand').val(order.demand);
            items$.append(item$);
        }

        pack$.find('.total .price').text(total);
        pack$.find('.total .num').text(num);

        p.append(pack$);
    }
}