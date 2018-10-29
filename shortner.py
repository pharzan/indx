from flask import Flask, request, render_template, redirect
from math import floor
from sqlite3 import OperationalError
import string, sqlite3
from urllib.parse import urlparse
from flask import jsonify
from subprocess import call
from urllib.request import Request,urlopen
from bs4 import BeautifulSoup
import json
from lxml import etree
import urllib
import urllib.parse
from lxml import html
import requests
from flask import Response
import eventlet
# from __future__ import with_statement


import datetime
from flask_jwt_extended import JWTManager
from flask_jwt_extended import (jwt_optional, create_access_token, create_refresh_token, jwt_required, jwt_refresh_token_required, get_jwt_identity, get_raw_jwt)

# eventlet.monkey_patch()

host = 'http://indx.ir/'
hdr = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
       'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
       'Accept-Encoding': 'gzip,deflate,compress',
       'Accept-Language': 'en-US,en;q=0.9,fa;q=0.8,tr;q=0.7'}
#Assuming urls.db is in your app root folder
def table_check():
    create_table = """
        CREATE TABLE WEB_URL(
        ID INTEGER PRIMARY KEY     AUTOINCREMENT,
        URL  TEXT    NOT NULL,
        CLICK INTEGER DEFAULT 0
        );
        """
    with sqlite3.connect('urls.db') as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(create_table)
        except OperationalError:
            pass
    create_users = """
        CREATE TABLE USERS (
              EMAIL TEXT PRIMARY KEY,
              PASSWORD TEXT NOT NULL CHECK(password<>''),
              SETTINGS JSON HIDDEN DEFAULT NULL,
              UNIQUE (email COLLATE NOCASE)
            );
        """
    with sqlite3.connect('urls.db') as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(create_users)
        except OperationalError:
            pass

# Base62 Encoder and Decoder
def toBase62(num, b = 62):
    if b <= 0 or b > 62:
        return 0
    base = string.digits + string.ascii_lowercase + string.ascii_uppercase + string.punctuation
    r = num % b
    res = base[r];
    q = floor(num / b)
    while q:
        r = q % b
        q = floor(q / b)
        res = base[int(r)] + res
    return res

def toBase10(num, b = 62):
    base = string.digits + string.ascii_lowercase + string.ascii_uppercase + string.punctuation
    limit = len(num)
    res = 0
    for i in range(limit):
        res = b * res + base.find(num[i])
    return res

def create_user(rJSON):
    settings = rJSON['SETTINGS']
    print(settings)
    with sqlite3.connect('urls.db') as conn:
        cursor = conn.cursor()
        create = """
        INSERT INTO USERS (EMAIL,PASSWORD,SETTINGS)
            VALUES ("%s","%s",json('%s'));
        """%(rJSON['EMAIL'],rJSON['PASSWORD'],settings)

        try:
            cursor.execute(create)
            print(create)
        except sqlite3.IntegrityError as e:
            print(e)
            return 'duplicate'
            pass
        except OperationalError:
            return 'unknown'
            pass
        return 'ok'

def login_user(rJSON):
    with sqlite3.connect('urls.db') as conn:
        EMAIL = rJSON['EMAIL']
        PASSWORD = rJSON['PASSWORD']
        cursor = conn.cursor()
        login = """
                SELECT SETTINGS FROM USERS
                    WHERE EMAIL="%s" AND PASSWORD="%s";
                """%(EMAIL,PASSWORD)
        
        try:
            result_cursor = cursor.execute(login)
        except:
            print(e)
            return [-1,'error']
            pass

        try:
            settings = result_cursor.fetchone()[0]
            expires = datetime.timedelta(days=60)
            access_token = create_access_token(identity = EMAIL,expires_delta=expires)
            refresh_token = create_refresh_token(identity = EMAIL)
            return {'statusCode':200,
                    'status':'ok',
                    'accessToken':access_token,
                    'Settings':settings
            }
        except:
            return{
                'statusCode':401,
                'status':'error'
            }

def save(rJSON):
    with sqlite3.connect('urls.db') as conn:
        cursor = conn.cursor()
        Q = """
        UPDATE USERS SET SETTINGS = json('%s')
        WHERE EMAIL="%s" ;
        """%(rJSON['SETTINGS'],rJSON['EMAIL'])
        print(Q)
        try:
            cursor.execute(Q)
        except sqlite3.IntegrityError as e:
            print(e)
            return 'duplicate'
            pass
        except OperationalError as e:
            print(e)
            return 'unknown'
            pass
        return 'ok'

def update(USER,SETTINGS):
    with sqlite3.connect('urls.db') as conn:
        cursor = conn.cursor()
        Q = """
        UPDATE USERS SET SETTINGS = json('%s')
        WHERE EMAIL="%s" ;
        """%(SETTINGS,USER)
        print(Q)
        try:
            cursor.execute(Q)
        except sqlite3.IntegrityError as e:
            print(e)
            return 'duplicate'
            pass
        except OperationalError as e:
            print(e)
            return 'unknown'
            pass
        return 'ok'

def load(EMAIL):
    with sqlite3.connect('urls.db') as conn:
        cursor = conn.cursor()
        login = """
                SELECT SETTINGS FROM USERS
                    WHERE EMAIL="%s";
                """%(EMAIL)
        try:
            result_cursor = cursor.execute(login)
        except:
            print(e)
            return [-1,'error']
            pass
        try:
            settings = result_cursor.fetchone()[0]
            return {'statusCode':1,
                    'status':'ok',
                    'Settings':settings
                    }
        except:
            return[-1,'error']
    # print(create)

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'pharzan'
jwt = JWTManager(app)

# csrf = CSRFProtect(app)

# Home page where user should enter 
# @csrf.exempt
@app.route('/login', methods=['POST'])
def login():
    rJSON = request.get_json()
    print(rJSON)
    if request.method == 'POST':
        if('EMAIL' in rJSON and 'PASSWORD' in rJSON):
            result = login_user(rJSON)
            return jsonify(result)
        else:
            return jsonify({'msg':'unauthorized'}),401
        


@app.route('/api/checkToken', methods=['GET'])
@jwt_optional
def checkToken():
    current_user = get_jwt_identity()
    if current_user:
        return jsonify({
            'message' :'approved',
            'user':current_user
            }),200
    else:
        return jsonify({
            'message' :'not approved',
            # 'user':current_user
            }),401

@app.route('/api/load', methods=['GET'])
@jwt_required
def loadSettings():
    user = get_jwt_identity()
    Settings = load(user)
    return jsonify({
        'Settings':Settings,
        'user':user,
        }),200

@app.route('/api/update', methods=['POST'])
@jwt_required
def updateSettings():
    user = get_jwt_identity()
    _Settings = {}
    rJSON = request.get_json()
    if request.method == 'POST':
        _Settings = update(user,rJSON['SETTINGS'])
    return jsonify({
        'Settings':_Settings,
        'user':user,
        }),200

@app.route('/api/newUser', methods=['POST'])
def newUser():

    rJSON = request.get_json()

    if('EMAIL' in rJSON and 'PASSWORD' in rJSON):        
        create_user(rJSON)
        return jsonify({
            'msg':'new user created'
            }),200
    else:
        return jsonify({'msg':'some fields missing'}),401



@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        rJSON = request.get_json()
        status='ok'
        if not None in rJSON:
            if 'action' in rJSON:
                if rJSON['action'] == 'newUser':
                    result = create_user(rJSON)
                    return jsonify({'response':result})
                # if rJSON['action'] == 'login':
                #     result = login_user(rJSON)
                #     return jsonify(result)
                if rJSON['action'] == 'save':
                    result = save(rJSON)
                    return jsonify(result)
                if rJSON['action'] == 'load':
                    result = load(rJSON)
                    return jsonify(result)
                id =rJSON['shortUrl'].split(host)[1]
                decoded_string = toBase10(id)
                # print('@#!!!!',decoded_string)
                with sqlite3.connect('urls.db') as conn:
                    cursor = conn.cursor()
                    get_click = """
                    SELECT CLICK FROM WEB_URL 
                        WHERE ID=%s;
                    """%(decoded_string)
                    result_cursor = cursor.execute(get_click)
                    click=result_cursor.fetchone()[0]
                    # print('URL',click)
                return jsonify({'status':status,'click':click})
            longUrl = rJSON['longUrl']
            short_url = '/'
            if urlparse(longUrl).scheme == '':
                longUrl = 'http://' + longUrl

            title = get_title(longUrl)
            if title:
                with sqlite3.connect('urls.db') as conn:
                    cursor = conn.cursor()
                    insert_row = """
                        INSERT INTO WEB_URL (URL)
                        VALUES ('%s')
                        """%(longUrl)
                    result_cursor = cursor.execute(insert_row)
                    encoded_string = toBase62(result_cursor.lastrowid)

                short_url = host + encoded_string
            if not title:
                status = '101' #title not found
            return jsonify({'longUrl':longUrl,
                'shortUrl':short_url,
                'status':status,
                'title':title,
                'id':encoded_string
                })
    return render_template('home.html')


def get_title(url):
    eventlet.monkey_patch()

    try:
        with eventlet.Timeout(5):
            page = requests.get(url,verify=False,headers=hdr,timeout=(2, 2),stream=False);
            tree = html.fromstring(page.content)
            soup = BeautifulSoup(page.content, "lxml")
            titles = soup.find("meta",  property="og:title")
            if titles != None: ##found in soup
                return titles['content']

            if not 'title' in locals():
                titles = tree.xpath('//title')
                title = 'بدون عنوان'

            if(len(titles)>0):
                title = titles[0].text
            print(title)
            return title
    except BaseException as e:
        title='بدون عنوان' 
        return title
   

@app.route('/<short_url>')
def redirect_short_url(short_url):
    decoded_string = toBase10(short_url)
    redirect_url = host
    with sqlite3.connect('urls.db') as conn:
        cursor = conn.cursor()
        update_click = """
        UPDATE WEB_URL SET CLICK=CLICK+1 
                WHERE ID=%s;
        """%(decoded_string)
        cursor.execute(update_click)
        select_row = """
                SELECT URL FROM WEB_URL
                    WHERE ID=%s
                """%(decoded_string)

        result_cursor = cursor.execute(select_row)
        try:
            redirect_url = result_cursor.fetchone()[0]
        except Exception as e:
            print(e) 
    return redirect(redirect_url)


if __name__ == '__main__':
    # This code checks whether database table is created or not
    table_check()
    app.run(debug=True)
