from flask import Flask,request,jsonify
from geolib import geohash
import requests

TICKET_TOKEN = "hkd6lIBkV2PJxAAC4ElXY8XvTAHT2wmL"
CATEGORY = {
    "Default":"",
    "Music":"KZFzniwnSyZfZ7v7nJ",
    "Sports":"KZFzniwnSyZfZ7v7nE",
    "Arts & Theatre":"KZFzniwnSyZfZ7v7na",
    "Film":"KZFzniwnSyZfZ7v7nn",
    "Miscellaneous":"KZFzniwnSyZfZ7v7n1"
    }

app = Flask(__name__)

@app.route('/')
def index():
    return app.send_static_file("events.html")


@app.route('/processData')
def processData():
    if request.method == 'GET':
        keyword = request.args.get('keyword')
        distance = request.args.get('distance')
        category = request.args.get('category')
        latitude = request.args.get('lat')
        longitude = request.args.get('lng')
    position = geohash.encode(latitude, longitude, 7)
    url = "https://app.ticketmaster.com/discovery/v2/events.json"
    params = {
        "apikey": TICKET_TOKEN,
        "geoPoint":position,
        "radius":distance,
        "segmentId": CATEGORY[category],
        "unit":"miles",
        "keyword":keyword
    }
    data = requests.get(url,params=params).json()

    if '_embedded' not in data:
        data = {}
    else:
        data = data['_embedded']['events'][:20]
        data = [{
            "Event": event["name"] if "name" in event.keys() else "",
            "Icon":event["images"][0]["url"] if "images" in event.keys() else "",
            "id":event["id"] if "id" in event.keys() else "",
            "Venue":event["_embedded"]["venues"][0]["name"] if "_embedded" in event.keys() and "venues" in event["_embedded"].keys() else"",
            "venue_id":event["_embedded"]["venues"][0]["id"] if "_embedded" in event.keys() and "venues" in event["_embedded"].keys() else"",
            "localDate":event["dates"]["start"]["localDate"] if "localDate" in event["dates"]["start"].keys() else "",
            "localTime":event["dates"]["start"]["localTime"] if "localTime" in event["dates"]["start"].keys() else "",
            "Genre": event["classifications"][0]["segment"]["name"] if "classifications" in event.keys() and "segment" in event["classifications"][0].keys() else ""
        } for event in data]
    jsonData = jsonify(data)
    return jsonData

@app.route('/eventDetail')
def eventDetail():
    if request.method == 'GET':
        id = request.args.get('id')
    url = "https://app.ticketmaster.com/discovery/v2/events/"+id+"?apikey="+TICKET_TOKEN
    res = requests.get(url).json()
    data = {
        "name":res["name"],
        "url": res["url"] if "url" in res.keys() else "",
        "localDate": res["dates"]["start"]["localDate"] if "dates" in res.keys() and "start" in res["dates"].keys() and "localDate" in res["dates"]["start"].keys() else "",
        "localTime": res["dates"]["start"]["localTime"] if "dates" in res.keys() and "start" in res["dates"].keys() and "localTime" in res["dates"]["start"].keys() else "",
        "seatmap": res["seatmap"]["staticUrl"] if "seatmap" in res.keys() and "staticUrl" in res["seatmap"].keys() else "",
        "status": res["dates"]["status"]["code"] if "dates" in res.keys() and "status" in res["dates"].keys() and "code" in res["dates"]["status"].keys() else "",
        "genre":[
            res["classifications"][0]["segment"]["name"] if "segment" in res["classifications"][0].keys() else "",
            res["classifications"][0]["genre"]["name"] if "genre" in res["classifications"][0].keys() else "",
            res["classifications"][0]["subGenre"]["name"] if "subGenre" in res["classifications"][0].keys() else "",
            res["classifications"][0]["type"]["name"] if "type" in res["classifications"][0].keys() else "",
            res["classifications"][0]["subType"]["name"] if "subType" in res["classifications"][0].keys() else ""
        ] if "classifications" in res.keys() else [],
        "attraction": res["_embedded"]["attractions"] if "_embedded" in res.keys() and "attractions" in res["_embedded"].keys() else [],
        "pricerange": res["priceRanges"][0] if "priceRanges" in res.keys() else "",
        "venue": res["_embedded"]["venues"][0]["name"] if "_embedded" in res.keys() and "venues" in res["_embedded"].keys() else ""   
    }
    jsonData = jsonify(data)
    return jsonData

@app.route('/venueDetail')
def venueDetail():
    if request.method == 'GET':
        str = request.args.get('str').replace(" ", "%20")
    url = "https://app.ticketmaster.com/discovery/v2/venues?apikey="+TICKET_TOKEN+"&keyword="+str
    print(str)
    res = requests.get(url).json()
    data = {
        "name":res["_embedded"]["venues"][0]["name"] if "_embedded" in res.keys() and "venues" in res["_embedded"].keys() else "",
        "address":res["_embedded"]["venues"][0]["address"]["line1"] if "_embedded" in res.keys() and "venues" in res["_embedded"].keys() else "",
        "postalCode":res["_embedded"]["venues"][0]["postalCode"] if "_embedded" in res.keys() and "venues" in res["_embedded"].keys() else "",
        "city":res["_embedded"]["venues"][0]["city"]["name"] if "_embedded" in res.keys() and "venues" in res["_embedded"].keys() else "",
        "statecode":res["_embedded"]["venues"][0]["state"]["stateCode"] if "_embedded" in res.keys() and "venues" in res["_embedded"].keys() else "",
        "upcoming":res["_embedded"]["venues"][0]["url"] if "_embedded" in res.keys() and "venues" in res["_embedded"].keys() else "",
        "img":res["_embedded"]["venues"][0]["images"] if "_embedded" in res.keys() and "venues" in res["_embedded"].keys() and "images" in res["_embedded"]["venues"][0].keys() else ""
    }
    jsonData = jsonify(data)
    return jsonData

if __name__ =='__main__':
    app.run(debug=True)