import tornado.web
import tornado.gen
import mysql
import uuid
import os
import data
import pickle

from tornado.escape import json_decode, json_encode

#waiter request page
class WaiterRequestHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('waiter-request.html')

    def post(self):
        fid = self.get_argument('cook_request', None)
        request_desk = self.get_argument('customer_request', None)
        submit_desk = self.get_argument('customer_submit', None)
        cancel_desk = self.get_argument('cancel_desk', None)


class WaiterCustomerRequestUpdateHandler(tornado.web.RequestHandler):
    @tornado.gen.coroutine
    def post(self):
        stamp = json_decode(self.get_argument('stamp'))
        gbuffer = yield data.customer_requests.update(stamp)
        response = {'status': 'ok', 'stamp': data.customer_requests.stamp, 'buffer': gbuffer}
        self.write(json_encode(response))
        raise tornado.gen.Return()


class WaiterCustomerSubmitUpdateHandler(tornado.web.RequestHandler):
    @tornado.gen.coroutine
    def post(self):
        stamp = json_decode(self.get_argument('stamp'))
        gbuffer = yield data.customer_submits.update(stamp)
        response = {'status': 'ok', 'stamp': data.customer_submits.stamp, 'buffer': gbuffer}
        self.write(json_encode(response))
        raise tornado.gen.Return()


class WaiterCookRequestUpdateHandler(tornado.web.RequestHandler):
    @tornado.gen.coroutine
    def post(self):
        stamp = json_decode(self.get_argument('stamp'))
        gbuffer = yield data.cook_requests.update(stamp)
        response = {'status': 'ok', 'stamp': data.cook_requests.stamp, 'buffer': gbuffer}
        self.write(json_encode(response))
        raise tornado.gen.Return()


#waiter cate page
class WaiterCateHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('waiter-cate.html')

    def post(self):
        cate = data.category
        response = {'cate': cate}
        self.write(json_encode(response))


class WaiterCateLoginHandler(tornado.web.RequestHandler):
    def post(self):
        desk = json_decode(self.get_argument('desk'))
        desk = desk.upper()
        if desk in data.desks:
            self.set_cookie('desk', desk)
            myorder = data.tables[desk].to_dict()
            response = {'myorder': myorder, 'desk': desk}
        else:
            response = {'status': 'error'}
        self.write(json_encode(response))


class WaiterCateLogoutHandler(tornado.web.RequestHandler):
    def post(self):
        self.clear_cookie('desk')
        response = {'status': 'ok'}
        self.write(json_encode(response))


class WaiterCateDetailHandler(tornado.web.RequestHandler):
    def post(self):
        cid = json_decode(self.get_argument('cid'))
        self.set_cookie('cid', str(cid))
        response = {'status': 'ok', 'next': '/waiter-detail'}
        self.write(json_encode(response))


class WaiterOrderUpdate(tornado.web.RequestHandler):
    @tornado.gen.coroutine
    def post(self):
        desk = self.get_cookie('desk')
        stamp = json_decode(self.get_argument('stamp'))
        table = data.tables[desk]
        myorder = yield table.update(stamp)
        response = {'myorder': myorder}
        self.write(json_encode(response))


#waiter detail page
class WaiterDetailHandler(tornado.web.RequestHandler):
    def get(self):
        cid = self.get_cookie('cid')
        cid = int(cid)
        t = filter(lambda x: x['cid'] == cid, data.category)
        name = ''
        if len(t) == 1:
            one = t[0]
            name = one['name']
        self.render('waiter-detail.html', name=name)

    def post(self):
        desk = self.get_cookie('desk')
        cid = self.get_cookie('cid')
        diet = data.diet
        myorder = data.tables[desk].to_dict()
        response = {'desk': desk, 'cid': cid, 'diet': diet, 'myorder': myorder}


#take order
class OrderHandler(tornado.web.RequestHandler):
    def post(self):
        role = self.get_cookie('role')
        desk = self.get_cookie('desk')
        ins = json_decode(self.get_argument('ins'))
        table = data.tables[desk]
        table.perform(role, ins)
        response = {'status': 'ok', 'myorder': table.to_dict()}
        self.write(json_encode(response))


#waiter order page
class WaiterOrderHandler(tornado.web.RequestHandler):
    def get(self):
        self.clear_cookie('cid')
        self.render('waiter-order.html')

    def post(self):

        desk = self.get_cookie('desk')
        table = data.tables[desk]
        response = {'myorder': table.to_dict()}
        self.write(json_encode(response))


#waiter search page
class WaiterSearchHaneler(tornado.web.RequestHandler):
    def get(self):
        self.render('waiter-search.html')

    def post(self):
        desk = self.get_cookie('desk')
        table = data.tables[desk]
        response = {'myorder': table.to_dict()}
        self.write(json_encode(response))


#waiter history page
class WaiterHistoryHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('waiter-history.html')

    def post(self):
        desk = self.get_cookie('desk')
        table = data.tables[desk]
        res = {'packs': [pack.to_dict() for pack in table.history]}
        self.write(json_encode(res))


#waiter transfer page
class WaiterTransferHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('waiter-transfer.html')