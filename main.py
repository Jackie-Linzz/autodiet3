__author__ = 'jerry'

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.iostream
import os
import mysql

from handlers_common import *
from handlers_manager import *
from handlers_waiter import *
from handlers_cashier import *
from handlers_customer import *
from handlers_cook import *

from tornado.options import define, options

define("port", default=8000, help="run on the given port", type=int)
define("debug", default=False, help="run in debug mode")



myhandlers = [
    (r'/', EntryHandler),
    (r'/faculty-login', FacultyLoginHandler),
    (r'/faculty-home', FacultyHomeHandler),
    (r'/faculty-secret', FacultySecretHandler),
    (r'/faculty-logout', FacultyLoginHandler),

    (r'/manager', ManagerHandler),
    (r'/company-data', CompanyDataHandler),
    (r'/company-info', CompanyInfoHandler),
    (r'/cate-add', CateAddHandler),
    (r'/cate-del', CateDelHandler),
    (r'/cate-data', CateDataHandler),
    (r'/diet-add', DietAddHandler),
    (r'/diet-del', DietDelHandler),
    (r'/diet-data', DietDataHandler),
    (r'/desk-add', DeskAddHandler),
    (r'/desk-del', DeskDelHandler),
    (r'/desk-data', DeskDataHandler),
    (r'/tar', TarHandler),
    (r'/faculty-add', FacultyAddHandler),
    (r'/faculty-del', FacultyDelHandler),
    (r'/faculty-data', FacultyDataHandler),
    (r'/period', PeriodHandler),
    (r'/trend', TrendHandler),
    (r'/detail', DetailHandler),
    (r'/cook-info', CookInfoHandler),
    (r'/one-cook-info', OneCookInfoHandler),

    (r'/waiter-request', WaiterRequestHandler),
    (r'/waiter-customer-request-update', WaiterCustomerRequestUpdateHandler),
    (r'/waiter-customer-submit-update', WaiterCustomerSubmitUpdateHandler),
    (r'/waiter-cook-request-update', WaiterCookRequestUpdateHandler),
    (r'/waiter-cate', WaiterCateHandler),
    (r'/waiter-cate-detail', WaiterCateDetailHandler),
    (r'/waiter-cate-login', WaiterCateLoginHandler),
    (r'/waiter-cate-logout', WaiterCateLogoutHandler),
    (r'/order', OrderHandler),
    (r'/waiter-detail', WaiterDetailHandler),
    (r'/waiter-order', WaiterOrderHandler),
    (r'/waiter-order-update', WaiterOrderUpdate),
    (r'/waiter-search', WaiterSearchHaneler),
    (r'/waiter-history', WaiterHistoryHandler),
    (r'/waiter-transfer', WaiterTransferHandler),

    (r'/cashier-bill', CashierBillHandler),
    (r'/cashier-bill-login', CashierBillLoginHandler),
    (r'/cashier-bill-logout', CashierBillLogoutHandler),
    (r'/cashier-pay', CashierPayHandler),

    (r'/customer-cate', CustomerCateHandler),
    (r'/customer-cate-detail', CustomerCateDetailHandler),
    (r'/customer-request', CustomerRequestHandler),
    (r'/customer-detail', CustomerDetailHandler),
    (r'/customer-detail-overlay', CustomerDetailOverlayHandler),
    (r'/customer-overlay', CustomerOverlayHandler),
    (r'/customer-order', CustomerOrderHandler),
    (r'/customer-history', CustomerHistoryHandler),
    (r'/customer-feedback', CustomerFeedbackHandler),
    (r'/feedback', FeedbackHandler),

    (r'/cook-cook', CookCookHandler),
    (r'/cook-update', CookUpdateHandler),
    (r'/cook-instruction', CookInstructionHandler),
    (r'/cook-other', CookOtherHandler),
    (r'/cook-request', CookRequestHandler)
              ]

settings = dict(
                cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
                login_url="/",
                template_path=os.path.join(os.path.dirname(__file__), "templates"),
                static_path=os.path.join(os.path.dirname(__file__), "static"),
                xsrf_cookies=False,
                debug=options.debug,
                )


def main():
    tornado.options.parse_command_line()
    application = tornado.web.Application(myhandlers, **settings)
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


def prepare():
    data.category = mysql.get_all('category')
    data.diet = mysql.get_all('diet')
    data.update_desk()


if __name__ == "__main__":
    prepare()
    main()

