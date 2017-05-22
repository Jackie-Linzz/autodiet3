import tornado.web
import data


from tornado.escape import json_decode, json_encode


class CashierBillHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('cashier-bill.html')


class CashierBillLoginHandler(tornado.web.RequestHandler):
    def post(self):
        desk = json_decode(self.get_argument('desk'))
        desk = desk.upper
        table = data.tables[desk]
        res = {'packs': [pack.to_dict() for pack in table.history if pack.pay == 0]}
        self.set_cookie('desk', desk)
        self.write(json_encode(res))


class CashierBillLogoutHandler(tornado.web.RequestHandler):
    def post(self):
        self.clear_cookie('desk')
        res = {'status': 'ok'}
        self.write(json_encode(res))


class CashierPayHandler(tornado.web.RequestHandler):
    def post(self):
        desk = self.get_cookie('desk')
        puid = json_decode(self.get_argument('puid'))
        table = data.tables[desk]
        for pack in table.history:
            if pack.puid == puid:
                pack.pay()
        res = {'packs': [pack.to_dict() for pack in table.history if pack.pay == 0]}
        self.write(json_encode(res))


