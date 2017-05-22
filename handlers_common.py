import tornado.web
import mysql
import uuid
import os
import data
import pickle

from tornado.escape import json_decode, json_encode


class EntryHandler(tornado.web.RequestHandler):
    def get(self):
        self.clear_all_cookies()
        if os.path.exists(data.company_file):
            with open(data.company_file, 'rb') as f:
                info = pickle.load(f)
        else:
            info = {'name': '', 'sname': '', 'address': '', 'desc': '', 'welcome': ''}
        self.render('entry.html', heading=info['sname'], welcome=info['welcome'])

    def post(self):
        #as customer
        self.set_cookie('role', 'customer')
        #set desk
        desk = json_decode(self.get_argument('desk')).upper()
        print desk
        if desk in data.desks:
            self.set_cookie('desk', desk)

            response = {'status': 'ok', 'next': '/customer-cate'}

        else:
            response = {'status': 'ok', 'next': '/'}
        self.write(json_encode(response))


class FacultyLoginHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('faculty-login.html')

    def post(self):
        fid = self.get_argument('fid', None)
        password = self.get_argument('password', None)
        if fid is None or password is None:
            response = {'status': 'error', 'next': '/faculty-login'}
            self.finish(json_encode(response))
            return
        fid = json_decode(fid)
        password = json_decode(password)

        faculty = mysql.get('faculty', {'fid': fid})
        if faculty is None:
            response = {'status': 'error', 'next': '/faculty-login'}
            self.finish(json_encode(response))
            return
        if len(faculty) != 1:
            response = {'status': 'error', 'next': '/faculty-login'}
            self.finish(json_encode(response))
            return

        row = faculty[0]
        response = {'status': 'error', 'next': '/faculty-login'}
        if row:
            if password == row['password']:
                role = row['role']

                self.set_cookie('role', role)
                self.set_cookie('fid', fid)
                response = {'status': 'ok', 'next': '/faculty-home'}

        self.finish(json_encode(response))


class FacultyHomeHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('faculty-home.html')

    def post(self):
        role = self.get_cookie('role')
        fid = self.get_cookie('fid')
        response = {}
        if role == 'waiter':
            response = {'status': 'ok', 'next': '/waiter-request'}
        elif role == 'cook':
            # init cook
            response = {'status': 'ok', 'next': '/cook-cook'}

        elif role == 'manager':
            response = {'status': 'ok', 'next': '/manager'}
        self.write(json_encode(response))


class FacultySecretHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('faculty-secret.html')

    def post(self):
        old = self.get_argument('old', None)
        password = self.get_argument('password', None)
        if old is None or password is None:
            response = {'status': 'error'}
            self.write(json_encode(response))
            return
        role = self.get_cookie('role')
        fid = self.get_cookie('fid')
        old = json_decode(old)
        password = json_decode(password)
        faculty = mysql.get('faculty', {'fid': fid, 'password': old, 'role': role})
        if faculty is None or len(faculty) != 1:
            response = {'status': 'error'}
            self.write(json_encode(response))
            return
        sql = 'update faculty set password = "%s" where fid = "%s"' % (password, fid)
        result = mysql.execute(sql)
        if result:
            response = {'status': 'ok'}
        else:
            response = {'status': 'error'}
        self.write(json_encode(response))


class FacultyLogoutHandler(tornado.web.RequestHandler):
    def post(self):
        self.clear_cookie('role')
        self.clear_cookie('fid')
        response = {'status': 'ok', 'next': '/'}
        self.finish(json_encode(response))