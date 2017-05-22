import MySQLdb
# don't forget to adjust conn.close() cursor.close()

HOST = 'localhost'
PORT = 3306
USER = 'autodiet3'
PASSWD = 'autodiet3'
DB = 'autodiet3'


#row is dict
def insert(table, row):

    if not isinstance(row, dict):
        return False
    columns = []
    values = []
    for k, v in row.items():
        columns.append(str(k))
        if isinstance(v, (str, unicode)):
            v = '"%s"' % v
        values.append(str(v))
    columns = ','.join(columns)
    values = ','.join(values)

    conn = MySQLdb.connect(host=HOST, port=PORT, user=USER, passwd=PASSWD, db=DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    sql = 'insert into %s (%s) values (%s)' % (table, columns, values)
    try:

        cursor.execute(sql)
        conn.commit()
        return True
    except Exception as e:
        print e
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def insert_many(table, rows):
    #check row key consistence
    if not isinstance(rows, (list, tuple)):
        return False
    if len(rows) < 1:
        return False
    if not isinstance(rows[0], dict):
        return False
    keys = rows[0].keys()
    columns = ','.join(keys)
    template = ','.join(['%s'] * len(keys))

    values = []
    for row in rows:
        if set(keys) != set(row.keys()):
            return False
        temp = []
        for key in keys:
            v = row[key]
            #if isinstance(v, (str, unicode)):
             #   v = '"%s"' % v
            temp.append(v)
        values.append(temp)

    conn = MySQLdb.connect(host=HOST, port=PORT, user=USER, passwd=PASSWD, db=DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    sql = 'insert into %s (%s) values (%s)' % (table, columns, template)

    try:

        cursor.executemany(sql, values)
        conn.commit()
        return True
    except Exception as e:
        print e
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def delete(table, con):

    if not isinstance(con, dict):
        return False
    condition = []
    for k, v in con.items():
        if isinstance(v, (str, unicode)):
            v = '"%s"' % v
        condition.append('%s = %s' % (k, v))
    condition = ' and '.join(condition)
    sql = 'delete from %s where %s' % (table, condition)

    conn = MySQLdb.connect(host=HOST, port=PORT, user=USER, passwd=PASSWD, db=DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    try:

        cursor.execute(sql)
        conn.commit()
        return True
    except Exception as e:
        print e
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def delete_all(table):

    conn = MySQLdb.connect(host=HOST, port=PORT, user=USER, passwd=PASSWD, db=DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    sql = 'delete from %s' % table
    try:

        cursor.execute(sql)
        conn.commit()
        return True
    except Exception as e:
        print e
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def update(table, row):

    pass


def execute(sql):
    conn = MySQLdb.connect(host=HOST, port=PORT, user=USER, passwd=PASSWD, db=DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    try:

        cursor.execute(sql)
        conn.commit()
        return True
    except Exception as e:
        print e
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def get(table, con):

    if not isinstance(con, dict):
        return False
    condition = []
    for k, v in con.items():
        if isinstance(v, (str, unicode)):
            v = '"%s"' % v
        condition.append('%s = %s' % (k, v))
    condition = ' and '.join(condition)
    sql = 'select * from %s where %s' % (table, condition)

    conn = MySQLdb.connect(host=HOST, port=PORT, user=USER, passwd=PASSWD, db=DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    try:

        cursor.execute(sql)
        conn.commit()
        columns = [d[0] for d in cursor.description]
        result = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return result
    except Exception as e:
        print e
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()


def get_all(table):
    sql = 'select * from %s' % table

    conn = MySQLdb.connect(host=HOST, port=PORT, user=USER, passwd=PASSWD, db=DB, charset='utf8')
    conn.autocommit(False)
    cursor = conn.cursor()
    try:

        cursor.execute(sql)
        conn.commit()
        columns = [d[0] for d in cursor.description]
        result = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return result
    except Exception as e:
        print e
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()





