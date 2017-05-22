import mysql
import MySQLdb
import datetime
import time
import util
import re
import uuid
from tornado.concurrent import Future

company_file = 'company_info'
category = []
diet = []
desks = []
faculty = []
tables = {}
cooks = {}
puid = 0

def update_desk():
    global desks
    t = mysql.get_all('desks')
    desks = map(lambda x: x['desk'], t)
    desks.sort()
    for desk in desks:
        tables[desk] = Table(desk)

#####################################################################################
def get_order(time_from, time_to):
    if not isinstance(time_from, float) or not isinstance(time_to, float):
        return None
    sql = 'select did, sum(num) as n from order_history where stamp >= %s and stamp < %s group by did order by did' % (time_from, time_to)
    conn = MySQLdb.connect(host=mysql.HOST, port=mysql.PORT, user=mysql.USER, passwd=mysql.PASSWD, db=mysql.DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    cursor.execute(sql)
    conn.commit()
    res = []
    total = 0
    for row in cursor.fetchall():
        did = row[0]
        num = row[1]
        t = filter(lambda x: x['did'] == did, diet)
        if len(t) != 1:
            continue
        item = t[0]
        total += item['price'] * num
        res.append({'did': did, 'name': item['name'], 'sum': num, 'price': item['price'], 'total': item['price'] * num})
    for item in res:
        if total == 0:
            item['percentage'] = '%.2f' % 0
        else:
            item['percentage'] = '%.2f' % (item['total'] * 100/total)
    res.sort(key=lambda x: x['did'])
    return res


def get_feedback(time_from, time_to):
    if not isinstance(time_from, float) or not isinstance(time_to, float):
        return None
    sql = 'select did, fb, sum(num) from feedback where stamp >= %s and stamp < %s group by did, fb' % (time_from, time_to)
    conn = MySQLdb.connect(host=mysql.HOST, port=mysql.PORT, user=mysql.USER, passwd=mysql.PASSWD, db=mysql.DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    cursor.execute(sql)
    conn.commit()

    res = map(lambda x: {'did': x['did'], 'name': x['name'], 'num': 0, 'good': 0, 'normal': 0, 'bad': 0}, diet)
    for row in cursor.fetchall():
        did = row[0]
        fb = row[1]
        num = row[2]
        t = filter(lambda x: x['did'] == did, res)
        if len(t) != 1:
            continue
        item = t[0]
        item['num'] += num

        if fb == -1:
            item['bad'] = num
        elif fb == 0:
            item['normal'] = num
        elif fb == 1:
            item['good'] = num
    res.sort(key=lambda x: x['did'])
    return res


def get_trend(num, base):
    if not isinstance(num, int):
        return None
    if num > 12 or num < 0:
        num = 12
    label = []
    end = range(num)
    end.reverse()
    start = map(lambda x: x + 1, end)
    if base == 'day':
        day = datetime.timedelta(days=1)
        today = datetime.date.today()
        time_from = map(lambda x: time.mktime((today - x * day).timetuple()), start)
        time_to = map(lambda x: time.mktime((today - x * day).timetuple()), end)
        label = map(lambda x: util.stamptostr(x), time_from)
    elif base == 'week':
        week = datetime.timedelta(weeks=1)
        today = datetime.date.today()
        time_from = map(lambda x: time.mktime((today - x * week).timetuple()), start)
        time_to = map(lambda x: time.mktime((today - x * week).timetuple()), end)
        label = map(lambda x: util.stamptostr(x), time_from)
    elif base == 'month':
        today = datetime.date.today()
        year = today.year
        month = today.month
        def get_date(x):
            if month-x > 0:
                return year, month-x
            else:
                return year-1, month - x + 12
        time_from = map(lambda x: datetime.date(get_date(x)[0], get_date(x)[1], 1), start)
        time_to = map(lambda x: datetime.date(get_date(x)[0], get_date(x)[1], 1), end)
        #print time_from
        #print time_to
        time_from = map(lambda x: time.mktime(x.timetuple()), time_from)
        time_to = map(lambda x: time.mktime(x.timetuple()), time_to)
        label = map(lambda x: util.stamptostr(x), time_from)
    sql = 'select did, sum(num) from order_history where stamp >= %s and stamp < %s group by did'
    interval = zip(time_from, time_to)
    res = []
    conn = MySQLdb.connect(host=mysql.HOST, port=mysql.PORT, user=mysql.USER, passwd=mysql.PASSWD, db=mysql.DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()

    for i in interval:
        cursor.execute(sql % i)
        conn.commit()
        total = 0
        for row in cursor.fetchall():
            did = row[0]
            num = row[1]
            t = filter(lambda x: x['did'] == did, diet)
            if len(t) != 1:
                continue
            item = t[0]
            total += item['price'] * num
        res.append(total)

    return label, res


def get_detail(time_from, time_to):
    if not isinstance(time_from, float) or not isinstance(time_to, float):
        return None
    sql = 'select puid, desk, did, num, stamp from order_history where stamp >= %s and stamp <= %s order by puid desc' % (time_from, time_to)
    conn = MySQLdb.connect(host=mysql.HOST, port=mysql.PORT, user=mysql.USER, passwd=mysql.PASSWD, db=mysql.DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    cursor.execute(sql)
    conn.commit()
    columns = [d[0] for d in cursor.description]
    result = [dict(zip(columns, row)) for row in cursor.fetchall()]
    for row in result:
        t = filter(lambda x: x['did'] == row['did'], diet)
        if len(t) != 1:
            continue
        row['name'] = t[0]['name']
        row['price'] = t[0]['price']
        row['time'] = time.strftime('%Y.%m.%d %H:%M:%S', time.localtime(row['stamp']))
    return result


def get_cookinfo(time_from, time_to):
    r = re.compile(r'^([0-9]{4})\.([0-9]{2}|[0-9])\.([0-9]{2}|[0-9])$')
    if not r.match(time_from) or not r.match(time_to):
        return None
    time_from = util.strtostamp(time_from)
    time_to = util.strtostamp(time_to)
    sql = 'select fid, did, sum(num) from cook_history where stamp >= %s and stamp < %s group by fid, did' % (time_from, time_to)
    conn = MySQLdb.connect(host=mysql.HOST, port=mysql.PORT, user=mysql.USER, passwd=mysql.PASSWD, db=mysql.DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    cursor.execute(sql)
    conn.commit()
    res = filter(lambda x: x['role'] == 'cook', faculty)
    res = map(lambda x: {'fid': x['fid'], 'name': x['name'], 'num': 0, 'num_per': 0, 'total': 0, 'total_per': 0}, res)
    num_total = 0
    total_total = 0
    for row in cursor.fetchall():
        fid = row[0]
        did = row[1]
        num = row[2]
        d = filter(lambda x: x['did'] == did, diet)
        item = filter(lambda x: x['fid'] == fid, res)
        if len(d) != 1 or len(item) != 1:
            continue
        d = d[0]
        item = item[0]
        item['num'] += num

        item['total'] += num * d['price']
        num_total += num
        total_total += num * d['price']
    for row in res:
        row['num_per'] = '%.2d' % (row['num'] * 100 / num_total)
        row['total_per'] = '%.2d' % (row['total'] * 100 / total_total)
    res.sort(key=lambda x: x['fid'])
    return res, num_total, total_total


def get_onecookinfo(fid, time_from, time_to):
    r = re.compile(r'^([0-9]{4})\.([0-9]{2}|[0-9])\.([0-9]{2}|[0-9])$')
    if not r.match(time_from) or not r.match(time_to):
        return None
    time_from = util.strtostamp(time_from)
    time_to = util.strtostamp(time_to)
    sql = 'select * from cook_history where fid = %s and stamp >= %s and stamp < %s' % (fid, time_from, time_to)
    sql = 'select feedback.did, fb, sum(feedback.num) from (' + sql + ') as p, feedback where p.uid = feedback.uid group by feedback.did, fb '
    conn = MySQLdb.connect(host=mysql.HOST, port=mysql.PORT, user=mysql.USER, passwd=mysql.PASSWD, db=mysql.DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    cursor.execute(sql)
    conn.commit()

    res = map(lambda x: {'did': x['did'], 'name': x['name'], 'num': 0, 'good': 0, 'normal': 0, 'bad': 0}, diet)
    for row in cursor.fetchall():
        did = row[0]
        fb = row[1]
        num = row[2]
        t = filter(lambda x: x['did'] == did, res)
        if len(t) != 1:
            continue
        item = t[0]
        item['num'] += num

        if fb == -1:
            item['bad'] = num
        elif fb == 0:
            item['normal'] = num
        elif fb == 1:
            item['good'] = num
    res.sort(key=lambda x: x['did'])
    return res


##################################################################################
class CustomerRequestBuffer(object):
    def __init__(self):
        self.waiters = set()
        self.buffer = []
        self.stamp = time.time()

    def request(self, desk):
        if desk is None:
            return
        if desk not in self.buffer:
            self.buffer.append(desk)
            self.buffer.sort()
            self.stamp = time.time()
            self.set_future()
        return self.buffer

    def answer(self, desk):
        if desk in None:
            return
        if desk in self.buffer:
            self.buffer.remove(desk)
            self.stamp = time.time()
            self.set_future()
        return self.buffer

    def set_future(self):
        for future in self.waiters:
            future.set_result(self.buffer)
        self.waiters = set()

    def update(self, stamp):
        future = Future()
        if stamp < self.stamp:
            future.set_result(self.buffer)
        else:
            self.waiters.add(future)
        return future


class CookRequestBuffer(object):
    def __init__(self):
        self.waiters = set()
        self.buffer = []
        self.stamp = time.time()

    def request(self, fid):
        if fid is None:
            return
        fids = map(lambda x: x[0], self.buffer)
        t = filter(lambda x: x['fid'] == fid, faculty)
        name = t[0]['name']
        if fid not in fids:
            self.buffer.append((fid, name))
            self.stamp = time.time()
            self.set_future()
        return self.buffer

    def answer(self, fid):
        if fid is None:
            return
        fids = map(lambda x: x[0], self.buffer)
        if fid in fids:
            self.buffer = filter(lambda x: x[0] != fid, self.buffer)
            self.stamp = time.time()
            self.set_future()
        return self.buffer

    def set_future(self):
        for future in self.waiters:
            future.set_result(self.buffer)
        self.waiters = set()

    def update(self, stamp):
        future = Future()
        if stamp < self.stamp:
            future.set_result(self.buffer)
        else:
            self.waiters.add(future)
        return future


class CookFinishBuffer(object):
    def __init__(self):
        self.waiters = set()
        self.buffer = []
        self.stamp = 0

    def request(self, one):
        if not isinstance(one, Order):
            return
        if one not in self.buffer:
            self.buffer.append(one)
            self.stamp = time.time()
            self.set_future()
        return [one.to_dict() for one in self.buffer]

    def answer(self, uid):
        if uid is None:
            return
        uids = map(lambda x: x.uid, self.buffer)
        if uid in uids:
            self.buffer = filter(lambda x: x.uid != uid, self.buffer)
            self.stamp = time.time()
            self.set_future()
        return [one.to_dict() for one in self.buffer]

    def set_future(self):
        for future in self.waiters:
            future.set_result([one.to_dict() for one in self.buffer])
        self.waiters = set()

    def update(self, stamp):
        future = Future()
        if stamp <= self.stamp:
            future.set_result([one.to_dict() for one in self.buffer])
        else:
            self.waiters.add(future)
        return future


customer_requests = CustomerRequestBuffer()
customer_submits = CustomerRequestBuffer()
cook_requests = CookRequestBuffer()
cook_finishes = CookFinishBuffer()
########################################################################


class Order(object):
    def __init__(self, did, demand=''):
        self.did = did
        self.demand = demand
        self.uid = str(uuid.uuid4())

        self.name = ''
        self.order = -1
        self.price = -1
        self.base = -1
        self.cid = -1

        self.get_info()
        self.num = self.base
        self.desk = -1
        self.cook = ''
        self.cookname = ''
        self.fb = 0

        self.puid = 0
        self.submit = 0

    def get_info(self):
        if self.did is None:
            return
        tmp = filter(lambda x: x['did'] == self.did, diet)
        if len(tmp) == 1:
            t = tmp[0]
            self.name = t['name']
            self.order = t['ord']
            self.price = t['price']
            self.base = t['base']
            self.cid = t['cid']

    def to_dict(self):
        result = {'did': self.did, 'demand': self.demand, 'uid': self.uid, 'name': self.name, 'ord': self.order, 'price': self.price,
                  'base': self.base, 'cid': self.cid, 'num': self.num, 'desk': self.desk, 'cook': self.cook, 'cookname': self.cookname}
        return result

    def order_history(self):
        mysql.insert('order_history', {'uid': self.uid, 'did': self.did, 'num': self.num, 'puid': self.puid, 'desk': self.desk, 'stamp': self.submit})

    def cook_history(self):
        mysql.insert('cook_history', {'fid': self.cook, 'uid': self.uid, 'did': self.did, 'num': self.num, 'stamp': time.time()})

    def feedback(self):
        mysql.insert('feedback', {'uid': self.uid, 'did': self.did, 'num': self.num, 'fb': self.fb, 'stamp': time.time()})


class Pack(object):
    def __init__(self, orders, submit, gd=''):
        global puid
        self.puid = puid
        puid += 1
        self.orders = [] + orders
        self.submit = submit
        self.gdemand = gd
        self.pay = 0
        self.bill = 0

        self.set_puid()
        self.set_submit()
        self.calc()

    def set_puid(self):
        for one in self.orders:
            one.puid = self.puid

    def set_submit(self):
        for one in self.orders:
            one.submit = self.submit

    def calc(self):
        self.bill = 0
        for one in self.orders:
            self.bill += one.price * one.num

    def pay(self):
        self.pay = 1

    def order_history(self):
        for one in self.orders:
            one.order_history()

    def to_dict(self):
        result = {'puid': self.puid, 'submit': self.submit, 'gdemand': self.gdemand, 'pay': self.pay, 'bill': self.bill,
                  'orders': [one.to_dict() for one in self.orders]}
        return result


class Table(object):
    def __init__(self, desk):
        self.desk = desk.upper()

        self.gdemand = ''
        self.orders = []
        self.left = []
        self.doing = []
        self.done = []
        self.cancel = []

        self.stamp = time.time()
        self.power = 0
        self.last = 0
        self.submit = 0
        self.status = 'none'

        self.history = [] #packs
        self.waiters = set()
        self.stamp = time.time()

    def calc_power(self):
        now = time.time()
        self.power = 0.2*(now - self.submit) + 0.8*(now - self.last)
        return self.power

    def perform(self, who, ins):

        #('+', did, demand) or ('-', uid) or ('gd', gdemand) or ('submit')
        if not isinstance(ins, (list, tuple)):
            return
        if who == 'customer':
            if self.status == 'lock':
                return
            self.stamp = time.time()

            if ins[0] == '+':
                self.status = 'none'
                one = Order(ins[1], ins[2])
                one.desk = self.desk
                self.orders.append(one)
            elif ins[0] == '-':
                self.status = 'none'
                uid = ins[1]
                self.orders = filter(lambda x: x.uid != uid, self.orders)
            elif ins[0] == 'gd':
                self.status = 'none'
                self.gdemand = ins[1]
            elif ins[0] == 'submit':
                if len(self.orders) > 0:
                    if self.status == 'none':
                        self.status = 'ready'
                    elif self.status == 'ready':
                        self.status = 'lock'
                        self.submit = time.time()
                        global customer_submits
                        customer_submits.request(self.desk)

        if who == 'waiter':
            self.stamp = time.time()
            if ins[0] == '+':
                self.status = 'none'
                one = Order(ins[1], ins[2])
                one.desk = self.desk
                self.orders.append(one)
            elif ins[0] == '-':
                self.status = 'none'
                uid = ins[1]
                self.orders = filter(lambda x: x.uid != uid, self.orders)
            elif ins[0] == 'gd':
                self.status = 'none'
                self.gdemand = ins[1]
            elif ins[0] == 'submit':
                if len(self.orders) > 0:
                    if self.status == 'none':
                        self.status = 'lock'

                    elif self.status == 'lock':
                        self.status = 'submitted'
                        self.submit = time.time()
                        self.submit()
        self.set_future()

    def submit(self):
        pack = Pack(self.orders, self.submit, self.gdemand)
        pack.order_history()
        self.history.insert(0, pack)

        self.left += self.orders
        self.orders = []

    def set_future(self):
        for future in self.waiters:
            future.set_result(self.to_dict())
        self.waiters = set()

    def update(self, stamp):
        future = Future()
        if stamp < self.stamp:
            future.set_result(self.to_dict())
        else:
            self.waiters.add(future)
        return future

    def to_dict(self):
        result = {'desk': self.desk, 'gdemand': self.gdemand, 'stamp': self.stamp, 'status': self.status,
                  'orders': [one.to_dict() for one in self.orders], 'left': [one.to_dict() for one in self.left],
                  'doing': [one.to_dict() for one in self.doing], 'done': [one.to_dict() for one in self.done]}
        return result


globalByways = set()

def select():
    global tables, globalByways
    deskorders = filter(lambda x: x is not None and len(x.left) > 0, tables.values())
    if deskorders:
        for one in deskorders:
            one.calc_power()
        deskorders.sort(key=lambda x: x.power)
        deskorders.reverse()
        for one in deskorders:

            left = one.left
            left.sort(key=lambda x: x.order)
            for s in left:
                if s not in globalByways:
                    globalByways.add(s)
                    return s
    return None

BY_WAY_SIZE = 4


def byway(one_order):
    global tables, globalByways, BY_WAY_SIZE
    if one_order is None:
        return []
    deskorders = filter(lambda x: x is not None and len(x.left) > 0, tables.values())
    orders = []
    for one in deskorders:
        orders += one.left
    orders = filter(lambda x: x.did == one_order.did, orders)
    result = set()
    for one in orders:
        if one not in globalByways:
            result.add(one)
            globalByways.add(one)
        if len(result) >= BY_WAY_SIZE:
            break
    return result


class Cook(object):
    def __init__(self, fid):
        self.fid = fid
        self.name = ''
        self.current = None
        self.byway = []
        self.doing = []
        self.done = []

        self.waiters = set()
        self.stamp = 0
        self.status = 'working'

        self.get_info()

    def get_info(self):
        global faculty
        t = filter(lambda x: x['fid'] == self.fid, faculty)
        if len(t) == 1:
            one = t[0]
            self.name = one['name']

    def take(self):
        if self.current is not None:
            return False
        if self.byway:
            return False
        self.current = select()
        if self.current is not None:
            self.byway = list(byway(self.current))
            return True
        return False

    def clear(self):
        global globalByways
        if self.current is not None:
            globalByways.remove(self.current)
            self.current = None
        if self.byway:
            globalByways = globalByways - set(self.byway)
            self.byway = []

    def accept(self, takens):
        t = [self.current] + self.byway
        dos = filter(lambda x: x.uid in takens, t)
        for one in dos:
            self.set_doing(one)
        self.clear()

    def set_doing(self, one):
        if not isinstance(one, Order):
            return
        global globalByways, tables
        desk = one.desk
        one.cook = self.fid
        one.cookname = self.name

        table = tables[desk]

        table.left.remove(one)
        table.doing.append(one)
        self.doing.append(one)

    def set_finish(self, one):
        if not isinstance(one, Order):
            return
        global tables
        desk = one.desk
        table = tables[desk]
        table.doing.remove(one)
        table.done.append(one)

        self.doing.remove(one)
        self.done.append(one)
        table.last = time.time()
        one.cook_history()

    def set_cancel(self, one):
        if not isinstance(one, Order):
            return
        global tables
        desk = one.desk
        table = tables[desk]
        table.doing.remove(one)
        table.left.append(one)
        self.doing.remove(one)

    def perform(self, ins):
        global globalByways
        #ins ('accept')
        if not isinstance(ins, (list, tuple)):
            return
        if ins[0] == 'accept':  # ('accept', ['uid','uid']) or ('accept')
            if self.current is None:
                self.take()
            else:
                self.accept(ins[1])
        elif ins[0] == 'next':  # ('next')
            self.clear()
            self.take()
        elif ins[0] == 'finish':  # ('finish', 'uid')
            t = filter(lambda x: x.uid == ins[1], self.doing)
            if len(t) == 1:
                one = t[0]
                self.set_finish(one)
                cook_finishes.request(one)

        elif ins[0] == 'cancel':  # ('cancel', 'uid')
            t = filter(lambda x: x.uid == ins[1], self.doing)
            if len(t) == 1:
                one = t[0]
                self.set_cancel(one)
        elif ins[0] == 'stop':  # ('stop')
            self.clear()
        elif ins[0] == 'delete':  #('delete', uid)
            t = filter(lambda x: x.uid == ins[1], self.byway)
            if len(t) == 1:
                one = t[0]
                self.byway.remove(one)
                globalByways.remove(one)
        self.stamp = time.time()
        self.set_future()

    def set_future(self):
        for future in self.waiters:
            future.set_result(self.to_dict())
        self.waiters = set()

    def update(self, stamp):
        future = Future()
        if stamp <= self.stamp:
            future.set_result(self.to_dict())
        else:
            self.waiters.add(future)
        return future

    def to_dict(self):
        if self.current is None:
            result = {'fid': self.fid, 'current': '', 'byway': [one.to_dict() for one in self.byway], 'stamp': self.stamp,
                      'doing': [one.to_dict() for one in self.doing], 'done': [one.to_dict() for one in self.done]}
        else:
            result = {'fid': self.fid, 'current': self.current.to_dict(), 'byway': [one.to_dict() for one in self.byway], 'stamp': self.stamp,
                      'doing': [one.to_dict() for one in self.doing], 'done': [one.to_dict() for one in self.done]}

        return result


