import tornado.web
import data

from tornado.escape import json_decode, json_encode


class CustomerCateHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('customer-cate.html')

    def post(self):
        cate = data.category
        response = {'cate': cate}
        self.write(json_encode(response))


class CustomerCateDetailHandler(tornado.web.RequestHandler):
    def post(self):

        cid = json_decode(self.get_argument('cid'))
        self.set_cookie('cid', str(cid))
        response = {'status': 'ok', 'next': '/customer-detail'}
        self.write(json_encode(response))


class CustomerRequestHandler(tornado.web.RequestHandler):
    def post(self):
        desk = self.get_cookie('desk')
        data.customer_requests.request(desk)
        response = {'status': 'ok'}
        self.write(json_encode(response))


class CustomerDetailHandler(tornado.web.RequestHandler):
    def get(self):
        cid = self.get_cookie('cid')
        cid = int(cid)
        cate = data.category
        t = filter(lambda x: x['cid']==cid, cate)
        one = t[0]
        self.render('customer-detail.html', name=one['name'])

    def post(self):
        cid = self.get_cookie('cid')
        cid = int(cid)
        diet = data.diet
        response = {'cid': cid, 'diet': diet}
        self.write(json_encode(response))


class CustomerDetailOverlayHandler(tornado.web.RequestHandler):
    def post(self):
        did = json_decode(self.get_argument('did'))
        did = str(did)
        self.set_cookie('did', did)
        response = {'status': 'ok', 'next': '/customer-overlay'}
        self.write(json_encode(response))


class CustomerOverlayHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('customer-overlay.html')

    def post(self):
        did = self.get_cookie('did')
        did = int(did)
        diet = data.diet
        d = filter(lambda x: x.did == did, diet)
        one = d[0]
        response = {'one': one, 'status': 'ok'}
        self.write(json_encode(response))


class CustomerOrderHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('customer-order.html')

    def post(self):
        pass


class CustomerHistoryHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('customer-history.html')

    def post(self):
        desk = self.get_cookie('desk')
        table = data.tables[desk]
        res = {'packs': [pack.to_dict() for pack in table.history if pack.pay == 0]}
        self.write(json_encode(res))


class CustomerFeedbackHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('customer-feedback.html')

    def post(self):
        desk = self.get_cookie('desk')
        table = data.tables[desk]
        res = {'packs': [pack.to_dict() for pack in table.history if pack.pay == 0]}
        self.write(json_encode(res))


class FeedbackHandler(tornado.web.RequestHandler):
    def post(self):
        info = json_decode(self.get_argument('info'))
        uid = info[0]
        fb = info[1]
        desk = self.get_cookie('desk')
        table = data.tables[desk]
        packs = filter(lambda x: x.pay == 0, table.history)
        for pack in packs:
            for order in pack.orders:
                if order.uid == uid:
                    order.fb = fb
                    break
        self.write('')





