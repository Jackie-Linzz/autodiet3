$(document).ready(function(){
    //cookie: role fid
    window.cook = null;
    //event stop
    $(document).on('tap', '.stop', function(){
        var ins = ['stop'];
        $.postJSON(
            '/cook-instruction',
            {'ins': json(ins)},
            function(){}
        );
    });
    //event request
    $(document).on('tap', '.request', function(){
        $.postJSON(
            '/cook-request',
            {},
            function(){}
        );
    });
    //event home
    $(document).on('tap', '.home', function(){
        window.location.replace('/faculty-home');

    });
    //poll
    updater.poll();
});
function showContent(){
    var cook = window.cook;
    var fid = cook.fid;
    var done = cook.done;
    var p = $('.left .content').empty();
    //show fid
    $('.middle .heading').text(fid);
    //show left
    for(var i in done){
        var one = done[i];
        var item$ = $('<div class="item">'+
                            '<div class="title">宫保鸡丁</div>'+
                            '<div class="desk">1</div>'+
                            '<div class="demand">不要辣</div>'+
                        '</div>');
        item$.find('.title').text(one.name);
        item$.find('.desk').text(one.desk);
        item$.find('.demand').text(one.demand);
        p.append(item$);
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

