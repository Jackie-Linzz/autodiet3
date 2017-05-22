$(document).ready(function(){
    //cookie: role desk
    //get packs
    window.packs = null;
    $.postJSON(
        '/customer-feedback',
        {},
        function(response){
            window.packs = response.packs;
            showPacks();
        }
    );
    //event fb tapped
    $(document).on('tap', '.fb', function(){
        var feedback = $(this).parent();
        feedback.find('.fb').removeClass('selected');
        $(this).addClass('selected');
        var selected = $(this).text();
        var fb = 0;
        if(selected == '好') {
            fb = 1;
        } else if(selected == '一般') {
            fb = 0;
        } else if(selected == '不好') {
            fb = -1;
        }
        var item = $(this).parents('.item');
        var uid = item.data('uid');
        var info = [uid, fb];
        $.postJSON(
            '/feedback',
            {'info': json(info)},
            function(response){}
        );
    });

    //event btn-left tapped
    $(document).on('tap', '.btn-left', function(){
        window.location.replace('/customer-order');
    });
});

function showPacks(){
    var packs = window.packs;
    var p = $('.content').empty();
    for(var i in packs) {
        var pack = packs[i];
        var time = pack.submit;
        var pack$ = $('<div class="pack">'+
                                    '<div class="time">2016年1月1日</div>'+
                                    '<div class="item">'+
                                        '<div class="name">宫保鸡丁</div>'+
                                        '<div class="feedback">'+
                                            '<a class="fb">好</a><!--'+
                                            '--><a class="fb selected">一般</a><!--'+
                                            '--><a class="fb">不好</a>'+
                                        '</div>'+
                                    '</div>'+
                        '</div>');
        pack$.data('puid', pack.puid);
        pack$.find('.time').text(time);
        pack$.find('.item').remove();

        var orders = pack.orders;
        for(var j in orders){
            var order = orders[j];
            var item$ = $('<div class="item">'+
                                '<div class="name">宫保鸡丁</div>'+
                                '<div class="feedback">'+
                                    '<a class="fb">好</a><!--'+
                                    '--><a class="fb selected">一般</a><!--'+
                                    '--><a class="fb">不好</a>'+
                                '</div>'+
                            '</div>');
            item$.data('uid', order.uid);
            item$.find('.name').text(order.name);
            pack$.append(item$);
        }

    }
    p.append(pack$);
}