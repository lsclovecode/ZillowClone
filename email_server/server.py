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

from cloudAMQP_client import CloudAMQPClient

# RabbitMQ config
### REPLACE CLOUD_AMQP_URL WITH YOUR OWN ###
CLOUD_AMQP_URL = '''amqp://htwgtamk:cINCaNwLYGPMb-8xmY3XvUWZPzA0Z6EN@hyena.rmq.cloudamqp.com/htwgtamk'''
EMAIL_SENDER_QUEUE_NAME = 'emailSenderTaskQueue'

# mongodb config
PROPERTY_TABLE_NAME = 'property'
USERS_PERMISSIN_DATABASE = 'real-estate-smart-view'
USERS_EMAILSENDER_PERMISSION = 'users'
FETCH_SIMILAR_PROPERTIES = True

SECONDS_IN_ONE_DAY = 3600 * 24
SECONDS_IN_ONE_WEEK = SECONDS_IN_ONE_DAY * 7

WAITING_TIME = 3

cloudAMQP_client = CloudAMQPClient(CLOUD_AMQP_URL, EMAIL_SENDER_QUEUE_NAME)

def getPermissionList():
    userDB = mongodb_client.getDB(USERS_PERMISSIN_DATABASE)
    sig = True
    users = []
    for user in userDB[USERS_EMAILSENDER_PERMISSION].find({'emailSend_permission':sig}):
        users.append(user['email'])
    return users




def handle_message(msg):
    task = json.loads(msg)
    #task = msg
    if (not isinstance(task, dict) or
        not 'zpid' in task or
        task['zpid'] is None):
        return

    zpid = task['zpid']

    users = getPermissionList()

    # Scrape the zillow for details
    property_detail = zillow_web_scraper_client.get_property_by_zpid(zpid)

    for user in users:
        emailSender.sendEmail(user,property_detail)



# Main thread
while True:
    # fetch a message
    if cloudAMQP_client is not None:
        msg = cloudAMQP_client.getDataFetcherTask()
        if msg is not None:
            handle_message(msg)
        time.sleep(WAITING_TIME)

#handle_message({'zpid':"15480474"})
