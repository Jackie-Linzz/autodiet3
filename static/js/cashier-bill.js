$(document).ready(function(){
    //cookie: role fid desk
    //window.packs
    window.packs = null;


    //if desk cookie exists, show content, else hide
    window.desk = getCookie('desk');
    if(desk == null) {
        state_out();
    } else {

        $('.heading').text(desk);
        state_in();
    }

    //btn-input event
    $('#btn-input').on('tap', function(){

        var desk = trim($('input.input').val());
        if (desk == '') return;

        $.postJSON(
            '/cashier-bill-login',
            {'desk': json(desk)},
            function(response) {
                window.packs = response.packs;
                window.desk = desk;
                $('.heading').text(desk);
                state_in();
                showPacks();
            }
        );

    });
    //btn-exit event
    $('.btn-exit').on('tap', function(){
        $.postJSON(
            '/cashier-bill-logout',
            {},
            function(response) {

                window.desk = null;
                $('.heading').text('无');
                state_out();

            }
        );
    });

    //btn-pay event
    $(document).on('tap', '.btn-pay', function(){
        var pack$ = $(this).parents('.pack');
        var puid = pack$.data('puid');

        $.postJSON(
            '/cashier-pay',
            {'puid': json(puid)},
            function(response){
                window.packs = response.packs;
                showPacks();
            }
        );
    });
    //btn-home event
    $(document).on('tap', '.btn-home', function(){
        window.location.replace('/faculty-home');
    });

});

function state_out(){
    $('.btn-exit').hide();
    $('.pack').hide();
    $('.heading').hide();
    $('.div-input').show();

}

function state_in(){
    $('.btn-exit').show();
    $('.pack').show();
    $('.heading').show();
    $('.div-input').hide();
}

function showPacks(){
    var packs = window.packs;
    var p = $('.packs').empty();
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
                            '<div class="status">未付款</div>'+
                            '<a class="btn-pay">付款</a>'+
                        '</div>');
        pack$.find('.time').text(submit);
        pack$.find('.gdemand').val(gdemand);


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

        pack$.data(pack);
        p.append(pack$);
    }
}