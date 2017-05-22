import tornado.web
import tornado.gen
import data

from tornado.escape import json_decode, json_encode


class CookCookHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('cook-cook.html')

    def post(self):
        pass


class CookUpdateHandler(tornado.web.RequestHandler):
    @tornado.gen.coroutine
    def post(self):
        fid = self.get_cookie('fid')
        cook = data.cooks[fid]
        stamp = json_decode(self.get_argument('stamp'))
        gbuffer = yield cook.update(stamp)
        response = {'cook': gbuffer}
        self.write(json_encode(response))
        raise tornado.gen.Return()


class CookInstructionHandler(tornado.web.RequestHandler):
    def post(self):
        fid = self.get_cookie('fid')
        cook = data.cooks[fid]
        ins = json_decode(self.get_argument('ins'))
        cook.perform(ins)
        self.write('')


class CookOtherHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('cook-other.html')


class CookRequestHandler(tornado.web.RequestHandler):
    def post(self):
        fid = self.get_cookie('fid')
        data.cook_requests.request(fid)
        self.write('')
