import requests

from json import dumps
from json import loads
from xmljson import badgerfish as bf

from xml.etree.ElementTree import fromstring

ZILLOW_ENDPOINT = 'http://www.zillow.com/webservice'

GET_SEARCH_RESULTS_API_NAME = 'GetSearchResults.htm'
GET_UPDATED_PROPERTY_DETAILS_API_NAME = 'GetUpdatedPropertyDetails.htm'
GET_COMPS_API_NAME = 'GetComps.htm'

ZWS_ID = '''X1-ZWz1fjzhaag64r_6ed93'''

def build_url(api_name):
    return '%s/%s' %(ZILLOW_ENDPOINT.strip('/'),api_name.strip('/'))

"""Zillow API: GetSearchResult"""
def getSearchResults(address, citystatezip, rentzestimate=False):
    payload = {
    'zws-id': ZWS_ID,
    'address': address,
    'citystatezip':citystatezip,
    'rentzestimate':rentzestimate
    }
    print  build_url(GET_COMPS_API_NAME)
    response = requests.get(build_url(GET_SEARCH_RESULTS_API_NAME),params=payload)
    print 'XML'
    print response
    #thransform XML to JSON
    #dumps thransform JSON to String
    #loads thransform String to JSON
    res_json = loads(dumps(bf.data(fromstring(response.text))))
    print 'JSON'
    print res_json
    #Extract info from response
    for key in res_json:
        print key

