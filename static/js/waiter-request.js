$(document).ready(function(){
    //secure cookie: who   fid
    window.customer_submits = [];
    window.customer_request = [];
    window.cook_request = [];

    //event home button
    $(document).on('tap', '.btn-home', function(){
        window.location.replace('/faculty-home');
    });
    //cook request
    $(document).on('tap', '.cook-request .btn-item', function(){
        var item = $(this).parents('.cook-request');
        var fid = item.data('fid');
        $.postJSON(
            '/waiter-request',
            {'cook_request': json(fid)},
            function(response){
                console.log(response);
                if(response.status != 'ok') return;
                window.cook_request = response.buffer;
                showCookRequests(window.cook_request);
            }
        );
    });
    //customer request
    $(document).on('tap', '.customer-request .btn-item', function(){
        var item = $(this).parents('.customer-request');
        var desk = item.data('desk');
        $.postJSON(
            '/waiter-request',
            {'customer_request': json(desk)},
            function(response){
                console.log(response);
                if(response.status != 'ok') return;
                window.customer_request = response.buffer;
                showCustomerRequests(window.customer_request);
            }
        );
    });
    //customer submit
    $(document).on('tap', '.customer-submit .btn-item', function(){
        var item = $(this).parents('.customer-submit');
        var desk = item.data('desk');
        $.postJSON(
            '/waiter-request',
            {'customer_submit': json(desk)},
            function(response){
                console.log(response);
                if(response.status != 'ok') return;
                window.customer_submits = response.buffer;
                showCustomerSubmits(window.customer_submits);
            }
        );
    });
    $(document).on('tap', '.customer-submit .btn-item-cancel', function(){
        var item = $(this).parents('.customer-submit');
        var desk = item.data('desk');
        $.postJSON(
            '/waiter-request',
            {'customer_submit_cancel': json(desk)},
            function(response){
                console.log(response);
                if(response.status != 'ok') return;
                window.customer_submits = response.buffer;
                showCustomerSubmits(window.customer_submits);
            }
        );
    });
    $(document).on('tap', '.btn-left', function(){
        window.location.replace('/waiter-transfer');
    });
    $(document).on('tap', '.btn-right', function(){
        window.location.replace('/waiter-cate');
    });

    cookRequestUpdater.poll();

    customerRequestUpdater.poll();

    customerSubmitUpdater.poll();
});

function showCookRequests(requests){
    var p = $('.cook').empty();
    if(!requests) return;

    for(var i in requests){
        var item = $('<div class="item cook-request">'+
                            '<div class="msg">小明师傅请求</div>'+
                            '<a class="btn-item">已知</a>'+
                        '</div>');
        var d = {'fid': requests[i][0], 'name': requests[i][1]};
        item.find('.msg').text(requests[i][1]+'师傅');
        item.data(d);
        p.append(item);
    }
}

function showCustomerRequests(requests) {
    $('.customer-request').remove();
    if(!requests) return;

    var p = $('.customer');
    for(var i in requests) {
        var item = $('<div class="item customer-request">'+
                            '<div class="msg">1桌请求</div>'+
                            '<a class="btn-item">已知</a>'+
                        '</div>');
        item.find('.msg').text(requests[i]+'桌');
        item.data('desk', requests[i]);
        p.append(item);
    }

}

function showCustomerSubmits(submits) {
    $('.customer-submit').remove();
    if(!submits) return;
    var p = $('.customer');

    for(var i in submits){
        var item = $('<div class="item customer-submit">'+
                            '<div class="msg">1桌下单</div>'+
                            '<a class="btn-item">下单</a>'+
                            '<a class="btn-item-cancel">取消</a>'+
                        '</div>');
        item.find('.msg').text(submits[i]+'桌');
        item.data('desk', submits[i]);
        p.prepend(item);
    }

}

var cookRequestUpdater = {
    interval: 800,
    stamp: 0,
    cursor: 0,
    poll: function(){
        console.log('polling:', cookRequestUpdater.cursor);
        cookRequestUpdater.cursor += 1;
        $.ajax({
            url: '/waiter-cook-request-update',
            type: 'POST',
            dataType: 'json',
            data: {'stamp': json(cookRequestUpdater.stamp), '_xsrf': getCookie('_xsrf')},
            success: cookRequestUpdater.onSuccess,
            error: cookRequestUpdater.onError
        });
    },
    onSuccess: function(response) {
        console.log('polling response', response);

        window.cook_request = response.buffer;
        cookRequestUpdater.stamp = response.stamp;
        showCookRequests(window.cook_request);

        cookRequestUpdater.interval = 800;
        setTimeout(cookRequestUpdater.poll, cookRequestUpdater.interval);
    },
    onError: function(response){
        cookRequestUpdater.interval = cookRequestUpdater.interval *2;
        setTimeout(cookRequestUpdater.poll, cookRequestUpdater.interval);
    }
};

var customerRequestUpdater = {
    interval: 800,
    stamp: 0,
    cursor: 0,
    poll: function(){
        console.log('polling:', customerRequestUpdater.cursor);
        customerRequestUpdater.cursor += 1;
        $.ajax({
            url: '/waiter-customer-request-update',
            type: 'POST',
            dataType: 'json',
            data: {'stamp': json(customerRequestUpdater.stamp), '_xsrf': getCookie('_xsrf')},
            success: customerRequestUpdater.onSuccess,
            error: customerRequestUpdater.onError
        });
    },
    onSuccess: function(response) {
        console.log('polling response', response);

        window.customer_request = response.buffer;
        customerRequestUpdater.stamp = response.stamp;
        showCustomerRequests(window.customer_request);

        customerRequestUpdater.interval = 800;
        setTimeout(customerRequestUpdater.poll, customerRequestUpdater.interval);
    },
    onError: function(response){
        customerRequestUpdater.interval = customerRequestUpdater.interval *2;
        setTimeout(customerRequestUpdater.poll, customerRequestUpdater.interval);
    }
};

var customerSubmitUpdater = {
    interval: 800,
    stamp: 0,
    cursor: 0,
    poll: function(){
        console.log('polling:', customerSubmitUpdater.cursor);
        customerSubmitUpdater.cursor += 1;
        $.ajax({
            url: '/waiter-customer-submit-update',
            type: 'POST',
            dataType: 'json',
            data: {'stamp': json(customerSubmitUpdater.stamp), '_xsrf': getCookie('_xsrf')},
            success: customerSubmitUpdater.onSuccess,
            error: customerSubmitUpdater.onError
        });
    },
    onSuccess: function(response) {
        console.log('polling response', response);

        window.customer_submits = response.buffer;
        customerSubmitUpdater.stamp = response.stamp;
        showCustomerSubmits(window.customer_submits);

        customerSubmitUpdater.interval = 800;
        setTimeout(customerSubmitUpdater.poll, customerSubmitUpdater.interval);
    },
    onError: function(response){
        customerSubmitUpdater.interval = customerSubmitUpdater.interval *2;
        setTimeout(customerSubmitUpdater.poll, customerSubmitUpdater.interval);
    }
};

