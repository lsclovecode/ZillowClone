#!/usr/bin/python
# -*- coding: UTF-8 -*-

import smtplib
from email.mime.text import MIMEText
import json
import os
import sys
import time
import pprint
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'data_fetcher'))

import mongodb_client
import emailSender
import zillow_web_scraper_client

USERLIST_DATABASE = 'real-estate-smart-view'
USERLIST_TABLE_NAME = 'userlists'

def sendEmail(email,test):
    _user = "nk1768@qq.com"
    _pwd  = "rhgkgyzoamklbdae"
    _to   = email


    zpid = test['zpid']
    street_address = test['street_address']
    city = test['city']
    state = test['state']
    zipcode = test['zipcode']
    list_price = test['list_price']

    db = mongodb_client.getDB(USERLIST_DATABASE)
    userlist = db[USERLIST_TABLE_NAME].find_one({'email':email,'zpid':zpid})
    print userlist
    old_list_price = userlist['list_price']

    massage = "the house which zpid is %s and list_price was %s, now the list_price is %s" %(zpid,list_price,old_list_price)

    msg = MIMEText(massage)
    msg["Subject"] = "Price Change Notation for your Watchlist in Smart Zillow"
    msg["From"]    = _user
    msg["To"]      = _to

    try:
        s = smtplib.SMTP_SSL("smtp.qq.com", 465)
        s.login(_user, _pwd)
        s.sendmail(_user, _to, msg.as_string())
        s.quit()
        print "Success!"
    except smtplib.SMTPException,e:
        print "Falied,%s"%e

