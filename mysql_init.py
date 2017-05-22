# coding=utf-8
import MySQLdb
import mysql
import util


HOST = 'localhost'
PORT = 3306
USER = 'autodiet3'
PASSWD = 'autodiet3'
DB = 'autodiet3'


conn = MySQLdb.connect(host=HOST, port=PORT, user=USER, passwd=PASSWD, db=DB, charset='utf8')
conn.autocommit(False)
cursor = conn.cursor()


categories = ({'cid': 1, 'name': '凉菜', 'ord': 1, 'description': ''},
              {'cid': 3, 'name': '主食', 'ord': 3, 'description': ''})


diet = [{'did': 1, 'name': '宫保鸡丁', 'price': 26.0, 'cid': 3, 'ord': 3, 'picture': '', 'base': 1, 'description': '', },
        {'did': 2, 'name': '状元养生炖', 'price': 26.0, 'cid': 3, 'ord': 3, 'picture': '', 'base': 1, 'description': '', },
        {'did': 3, 'name': '花生米', 'price': 26.0, 'cid': 1, 'ord': 1, 'picture': '', 'base': 0.5, 'description': '', },
        {'did': 4, 'name': '海带', 'price': 26.0, 'cid': 1, 'ord': 1, 'picture': '', 'base': 1, 'description': '', }]


faculty = [{'fid': '0001', 'name': 'jackie', 'role': 'founder', 'password': 'root'},
           {'fid': '0002', 'name': 'manager', 'role': 'manager', 'password': 'manager'},
           {'fid': '0003', 'name': 'waiter', 'role': 'waiter', 'password': 'waiter'},
           {'fid': '0004', 'name': 'cook', 'role': 'cook', 'password': 'cook'},
           {'fid': '0005', 'name': '5', 'role': 'cook', 'password': 'cook'}]

order_history = [{'uid': '1', 'did': 1, 'puid': '1', 'desk': 1, 'num': 1, 'stamp': util.strtostamp('2015.1.8')},
                 {'uid': '2', 'did': 2, 'puid': '1', 'desk': 1, 'num': 1, 'stamp': util.strtostamp('2015.1.8')},
                 {'uid': '3', 'did': 3, 'puid': '3', 'desk': 3, 'num': 0.5, 'stamp': util.strtostamp('2015.2.8')},
                 {'uid': '4', 'did': 4, 'puid': '4', 'desk': 4, 'num': 1, 'stamp': util.strtostamp('2015.3.8')}]

customer_history = [{'session': 'a', 'desk': '1', 'desk_uid': '1', 'stamp': util.strtostamp('2015.1.8')},
                    {'session': 'b', 'desk': '2', 'desk_uid': '3', 'stamp': util.strtostamp('2015.2.8')},
                    {'session': 'c', 'desk': '1', 'desk_uid': '4', 'stamp': util.strtostamp('2015.3.8')}]

cook_history = [{'fid': '0004', 'uid': '1', 'did': 1, 'num': 1, 'stamp': util.strtostamp('2015.1.8')},
                {'fid': '0004', 'uid': '2', 'did': 2, 'num': 1, 'stamp': util.strtostamp('2015.1.8')},
                {'fid': '0005', 'uid': '3', 'did': 3, 'num': 1, 'stamp': util.strtostamp('2015.2.8')},
                {'fid': '0005', 'uid': '4', 'did': 4, 'num': 1, 'stamp': util.strtostamp('2015.3.8')}]

feedback = [{'uid': '2', 'did': 2, 'num': 1, 'fb': -1, 'stamp': util.strtostamp('2015.1.8')},
            {'uid': '2', 'did': 2, 'num': 1, 'fb': 1, 'stamp': util.strtostamp('2015.1.8')},
            {'uid': '2', 'did': 3, 'num': 1, 'fb': 1, 'stamp': util.strtostamp('2015.1.8')},
            {'uid': '2', 'did': 3, 'num': 1, 'fb': 1, 'stamp': util.strtostamp('2015.1.8')}]

comment = [{'session': 'ss', 'comment': 'ssss', 'stamp': util.strtostamp('2015.1.8')}]

#diet_stat = [{'id': 1, 'name': 'ss', 'price': 88, 'num': 1, 'stamp_from': time.time(), 'stamp_to': time.time()}]
#cook_stat = [{'fid': 'ff', 'name': 'dd', 'num': 1, 'val': 88, 'stamp_from': time.time(), 'stamp_to': time.time()}]
'''
mysql.insert('category', categories[0])
mysql.insert_many('category', categories[1:])
print mysql.get_all('category')

mysql.insert('diet', diet[0])
mysql.insert_many('diet', diet[1:])
print mysql.get_all('diet')

mysql.insert('faculty', faculty[0])
mysql.insert_many('faculty', faculty[1:])
print mysql.get_all('faculty')

mysql.insert('order_history', order_history[0])
mysql.insert_many('order_history', order_history[1:])
print mysql.get_all('order_history')


mysql.insert('cook_history', cook_history[0])
mysql.insert_many('cook_history', cook_history[1:])
print mysql.get_all('cook_history')


mysql.insert('feedback', feedback[0])
mysql.insert_many('feedback', feedback[1:])
'''
print mysql.get_all('feedback')

cursor.close()
conn.close()