$(document).on(function(){
    //cookie: role fid
    window.cook = null;
    window.selected = [];
    //get cook data
    //poll will do it automatically

    //event left item close tapped
    $(document).on('tap', '.left .close', function(){
        //('cancel', uid)
        var item = $(this).parents('.item');
        var uid = item.data('uid');
        var ins = ['cancel', uid];
        $.postJSON(
            '/cook-instruction',
            {'ins': json(ins)},
            function(){}
        );
    });
    //event left item finish tapped
    $(document).on('tap', '.left .finish', function(){
        //('finish', uid)
        var item = $(this).parents('.item');
        var uid = item.data('uid');
        var ins = ['finish', uid];
        $.postJSON(
            '/cook-instruction',
            {'ins': json(ins)},
            function(){}
        );
    });
    //event middle fid tapped
    $(document).on('tap', '.middle .heading', function(){
        window.location.replace('/cook-other');
    });
    //event middle accept tapped
    $(document).on('tap', '.middle .accept', function(){
        if(window.cook.current == '') {
            var ins = ['accept'];
            $.postJSON(
                '/cook-instruction',
                {'ins': json(ins)},
                function(){}
            );
        } else {
            window.selected.push(window.cook.current.uid);
            var ins = ['accept', selected];
            $.postJSON(
                '/cook-instruction',
                {'ins': json(ins)},
                function(){
                    window.selected = [];
                }
            );
        }
    });
    //event middle next tapped
    $(document).on('tap', '.middle .next', function(){
        var ins = ['next'];

        $.postJSON(
            '/cook-instruction',
            {'ins': json(ins)},
            function(){}
        );
    });
    //event right item tapped
    $(document).on('tap', '.right .item', function(){
        var item = $(this).parents('item');
        var uid = item.data('uid');
        var flag = false;
        var index = selected.indexOf(uid);
        if(index != -1) flag = true;


        if(flag == false) {
            selected.push(uid);

        } else {

            selected.splice(index,1);
        }
        showSelected();
    });
    //event right item close tapped
    $(document).on('tap', '.right .close', function(){
        var item = $(this).parents('.item');
        var uid = item.data('uid');
        var index = selected.indexOf(uid);
        if(index != -1) {
            selected.splice(index,1);
        }
        var ins = ['delete', uid];
        $.postJSON(
            '/cook-instruction',
            {'ins': json(ins)},
            function(){}
        );
    });
    //poll
    updater.poll();
});
function showSelected(){
    var items = $('.right .item');
    items.removeClass('selected');
    items.each(function(){
        var uid = $(this).data('uid');
        var index = window.selected.indexOf(uid);
        if(index != -1) $(this).addClass('selected');
    });
}

function showContent() {
    var cook = window.cook;
    var fid = cook.fid;
    var current = cook.current;
    var byway = cook.byway;
    var doing = cook.doing;
    var done = cook.done;

    //show fid
    $('.middle .heading').text(fid);
    //show current
    if(current != '') {
        $('.current').data('uid', current.uid);
        $('.current .title').text(current.name);
        $('.current .desk').text(current.desk);
        $('.current .demand').text(current.demand);
    }
    //show left
    var pl = $('.left .content').empty();
    for(var i in doing) {
        var item$ = $('<div class="item">'+
                            '<div class="close">X</div>'+
                            '<div class="title">宫保鸡丁</div>'+
                            '<div class="desk">1</div>'+
                            '<div class="demand">不要辣</div>'+
                            '<div class="finish">完成</div>'+
                        '</div>');
        item$.data(doing[i]);
        item$.find('.title').text(doing[i].name);
        item$.find('.desk').text(doing[i].desk);
        item$.find('.demand').text(doing[i].demand);
        pl.append(item$);
    }
    //show right
    var pr = $('.right .content').empty();
    for(var j in byway) {
        var item$ = $('<div class="item">'+
                            '<div class="close">X</div>'+
                            '<div class="title">宫保鸡丁</div>'+
                            '<div class="desk">1</div>'+
                            '<div class="demand">不要辣</div>	'+
                        '</div>');
        item$.data(byway[j]);
        item$.find('.title').text(byway[j].name);
        item$.find('.desk').text(byway[j].desk);
        item$.find('.demand').text(byway[j].demand);
        pr.append(item$);
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
            url: '/cook-update',
            type: 'POST',
            dataType: 'json',
            data: {'stamp': json(updater.stamp), '_xsrf': getCookie('_xsrf')},
            success: updater.onSuccess,
            error: updater.onError
        });

    },
    onSuccess: function(response){
        window.cook = response.cook;
        updater.stamp = window.cook.stamp;
        showContent();
        showSelected();
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
