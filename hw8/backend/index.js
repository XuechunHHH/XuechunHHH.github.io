const axios=require('axios');
const cors=require('cors');
const cookie=require('cookie-parser');
const ngeohash=require('ngeohash');

// [START gae_node_request_example]
const express = require('express');

const app = express();
const token_ticket = 'hkd6lIBkV2PJxAAC4ElXY8XvTAHT2wmL';

var dic={
    "Default":"",
    "Music":"KZFzniwnSyZfZ7v7nJ",
    "Sports":"KZFzniwnSyZfZ7v7nE",
    "Arts":"KZFzniwnSyZfZ7v7na",
    "Film":"KZFzniwnSyZfZ7v7nn",
    "Miscellaneous":"KZFzniwnSyZfZ7v7n1"
};
// const google_id = 'AIzaSyBPQYD1haDattmC5HT9njXNSyQIcELGw9Q';
// const ip = 'b5d2f54b8937ca';
app.use(cors()).use(cookie());

app.get('/', (req, res) => {
    res.send("jzlsb")
});

app.get('/suggest', (req, res) => {
    var key = req.query.keyword;
    axios.get('https://app.ticketmaster.com/discovery/v2/suggest', {
        params: {
            apikey: token_ticket,
            keyword: key
        }
    })
        .then(function (response) {
            var data = response.data;
            var list = [];
            if (!data.hasOwnProperty('_embedded') || !data['_embedded'].hasOwnProperty('attractions')){
                res.status(200).send([]);
            }else{
                for (var i=0;i<data['_embedded']['attractions'].length;++i){
                    if (data['_embedded']['attractions'][i].hasOwnProperty('name')) {
                        list.push(data['_embedded']['attractions'][i]['name']);
                    }
                }
                res.status(200).send(list);
            }
        })
        .catch(function (error) {
            res.status(201).send(error.message);
        })
});

app.get('/search', (req, res) => {
    var lat = req.query.lat;
    var lng = req.query.lng;
    var keyword = req.query.keyword;
    var category = req.query.category;
    var distance = req.query.distance;
    var segmentId = dic[category];
    var loc = ngeohash.encode(lat,lng,7);
    axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
        params: {
            apikey: token_ticket,
            keyword: keyword,
            segmentId: segmentId,
            radius: distance,
            unit: "miles",
            geoPoint: loc
        }
    })
        .then(function (response) {
            var data = response.data;
            var form = [];
            if (!data.hasOwnProperty('_embedded')){
                res.status(200).send([]);
            }else{
                data = data['_embedded']['events'].slice(0,20);
                for (var i=0;i<data.length;++i){
                    try {
                        var event = data[i]['name'];
                    }catch (e){
                        var event = null;
                    }
                    try {
                        var icon = data[i]['images'][0]['url'];
                    }catch (e){
                        var icon = null;
                    }
                    try {
                        var id = data[i]["id"];
                    }catch (e){
                        var id = null;
                    }
                    try {
                        var venue = data[i]["_embedded"]["venues"][0]["name"];
                    }catch (e){
                        var venue = null;
                    }
                    try {
                        var localDate = data[i]["dates"]["start"]["localDate"];
                    }catch (e){
                        var localDate = null;
                    }
                    try {
                        var localTime = data[i]["dates"]["start"]["localTime"];
                    }catch (e){
                        var localTime = null;
                    }
                    try {
                        var genre = data[i]["classifications"][0]["segment"]["name"];
                    }catch (e){
                        var genre = null;
                    }
                    var dic = {
                        event: event,
                        icon: icon,
                        id: id,
                        venue: venue,
                        localDate: localDate,
                        localTime: localTime,
                        genre: genre
                    };
                    form.push(dic);
                }
                res.status(200).send(form);
            }
        })
        .catch(function (error) {
            res.status(201).send(error.message);
        })
});

app.get('/event', (req, res) => {
    var lat = req.query.lat;
});

// Start the server
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;
