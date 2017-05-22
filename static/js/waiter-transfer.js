$(document).ready(function(){
    // cookie : role;
    window.finishes = [];
    //button event
    $(document).on('tap', '.button', function(){
        var item = $(this).parents('.item');
        var uid = item.data('uid');
        $.postJSON(
            '/waiter-finishes',
            {'uid': json(uid)},
            function(response){

            }
        );
    });
    //footer left event
    $(document).on('tap', '.btn-left', function(){
        window.location.replace('/waiter-request');
    });
    //footer right event
    $(document).on('tap', '.btn-right', function(){
        window.location.replace('/waiter-order');
    });
    //poll
    updater.poll();
});

function showContent(){
    if(window.finishes == null) return;
    var finishes = window.finishes;
    var p = $('.content').empty();
    for(var i in finishes){
        var item = $('<div class="item">'+
                            '<div class="title">title</div>'+
                            '<a class="button">OK</a>'+
                        '</div>');
        item.data(finishes[i]);
        var title = item.data('name')+':'+item.data('desk')+':'+item.data('cookname')+':'+item.data('demand');
        item.find('.title').text(title);
        p.append(item);
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
            url: '/waiter-finish-update',
            type: 'POST',
            dataType: 'json',
            data: {'stamp': json(updater.stamp), '_xsrf': getCookie('_xsrf')},
            success: updater.onSuccess,
            error: updater.onError
        });

    },
    onSuccess: function(response){
        window.finishes = response.finishes;
        updater.stamp = window.myorder.stamp;
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