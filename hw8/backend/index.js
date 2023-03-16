const axios=require('axios');
const cors=require('cors');
const cookie=require('cookie-parser');
const ngeohash=require('ngeohash');

// [START gae_node_request_example]
const express = require('express');
const SpotifyWebApi = require("spotify-web-api-node");

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
    res.send("jzlsb");
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
    var id = req.query.id;
    var url = 'https://app.ticketmaster.com/discovery/v2/events/'+id;
    axios.get(url, {
        params: {
            apikey: token_ticket
        }
    })
        .then(function (response) {
            var data = response.data;
            try {
                var name = data['name'];
            }catch (e){
                var name = null;
            }
            try {
                var url = data["url"];
            }catch (e){
                var url = null;
            }
            try {
                var localDate = data["dates"]["start"]["localDate"];
            }catch (e){
                var localDate = null;
            }
            try {
                var attractions = data["_embedded"]["attractions"];
            }catch (e){
                var attractions = null;
            }
            var artist = [];
            if(attractions !== null) {
                try {
                    for (var i = 0; i < attractions.length; ++i) {
                        try {
                            artist.push(attractions[i]["name"]);
                        } catch (e) {
                            artist.push(null);
                        }
                    }
                }catch (e){}
            }
            try {
                var venue = data["_embedded"]["venues"][0]["name"];
            }catch (e){
                var venue = null;
            }
            var genre = [];
            try {
                genre.push(data["classifications"][0]["segment"]["name"]);
            }catch (e){
                genre.push(null);
            }
            try {
                if (!genre.includes(data["classifications"][0]["genre"]["name"]) && data["classifications"][0]["genre"]["name"] !== 'Undefined'){
                    genre.push(data["classifications"][0]["genre"]["name"]);
                }
            }catch (e){
                genre.push(null);
            }
            try {
                if (!genre.includes(data["classifications"][0]["subGenre"]["name"]) && data["classifications"][0]["subGenre"]["name"] !== 'Undefined'){
                    genre.push(data["classifications"][0]["subGenre"]["name"]);
                }
            }catch (e){
                genre.push(null);
            }
            try {
                if (!genre.includes(data["classifications"][0]["type"]["name"]) && data["classifications"][0]["type"]["name"] !== 'Undefined'){
                    genre.push(data["classifications"][0]["type"]["name"]);
                }
            }catch (e){
                genre.push(null);
            }
            try {
                if (!genre.includes(data["classifications"][0]["subType"]["name"]) && data["classifications"][0]["subType"]["name"] !== 'Undefined'){
                    genre.push(data["classifications"][0]["subType"]["name"]);
                }
            }catch (e){
                genre.push(null);
            }
            try {
                var pricerange = data["priceRanges"][0];
            }catch (e){
                var pricerange = null;
            }
            try {
                var status = data["dates"]["status"]["code"];
            }catch (e){
                var status = null;
            }
            try {
                var seatmap = data["seatmap"]["staticUrl"];
            }catch (e){
                var seatmap = null;
            }
            var dic = {
                name: name,
                localDate: localDate,
                artist: artist,
                venue: venue,
                genre: genre,
                pricerange: pricerange,
                status: status,
                url: url,
                seatmap: seatmap,
                id: id
            };
            res.status(200).send(dic);
        })
        .catch(function (error) {
            res.status(201).send(error.message);
        })
});

app.get('/artist', (req, res) => {
    var name = req.query.name;

    // var SpotifyWebApi = require('spotify-web-api-node');
// credentials are optional
    var spotifyApi = new SpotifyWebApi({
        clientId: 'c4bb7efcffd34c10a562caa8f9a53bd7',
        clientSecret: '30988567a57542298ca240ee2d77971a',
        redirectUri: 'http://localhost:8080/callback'
    });

    spotifyApi.clientCredentialsGrant().then(
        function(data) {
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.searchArtists(name)
                .then(function(data) {
                    try {
                        var returnNames = data.body["artists"]["items"];
                        console.log(returnNames);
                    }catch (e){
                        var returnNames = {};
                    }
                    var cnt = 0;

                    for (var i=0;i<returnNames.length;++i){
                        cnt ++;
                        var artist = {};
                        if (returnNames[i]["name"].toUpperCase() === name.toUpperCase()){
                            artist["name"] = returnNames[i]["name"];
                            try {
                                artist["followers"] = returnNames[i]["followers"]["total"];
                            }catch (e){
                                artist["followers"] = null;
                            }
                            try {
                                artist["popularity"] = returnNames[i]["popularity"];
                            }catch (e){
                                artist["popularity"] = null;
                            }
                            try {
                                artist["url"] = returnNames[i]["external_urls"]["spotify"];
                            }catch (e){
                                artist["url"] = null;
                            }
                            try {
                                artist["image"] = returnNames[i]["images"][0]["url"];
                            }catch (e){
                                artist["image"] = null;
                            }
                            try {
                                artist["id"] = returnNames[i]["id"];
                            }catch (e){
                                artist["id"] = null;
                            }
                            res.status(200).send(artist);
                            break;
                        }
                    }
                    if (cnt === returnNames.length){
                        res.status(200).send({});
                    }

                    }, function(err) {
                    console.error(err);
                });
        },
        function(err) {
            console.log(
                'Something went wrong when retrieving an access token',
                err.message
            );
        });

});

app.get('/album', (req, res) => {
    var id = req.query.id;

    var SpotifyWebApi = require('spotify-web-api-node');
// credentials are optional
    var spotifyApi = new SpotifyWebApi({
        clientId: 'c4bb7efcffd34c10a562caa8f9a53bd7',
        clientSecret: '30988567a57542298ca240ee2d77971a',
        redirectUri: 'http://localhost:8080/callback'
    });

    spotifyApi.clientCredentialsGrant().then(
        function(data) {
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.getArtistAlbums(id)
                .then(function(data) {
                    try {
                        var imagesRe = data.body["items"];
                    }catch (e){
                        var imagesRe = {};
                    }
                    var album = [];
                    var cnt = imagesRe.length;
                    if (cnt>3){
                        cnt = 3;
                    }
                    for (var i=0;i<cnt;++i){
                        album.push(imagesRe[i]["images"][0]["url"]);
                    }
                    res.status(200).send(album);
                }, function(err) {
                    res.send([]);
                });
        },
        function(err) {
            console.log(
                'Something went wrong when retrieving an access token',
                err.message
            );
        });

});

app.get('/venue', (req, res) => {
    var str = req.query.str;
    axios.get('https://app.ticketmaster.com/discovery/v2/venues', {
        params: {
            apikey: token_ticket,
            keyword: str
        }
    })
        .then(function (response) {
            var data = response.data;
            var venue = {};
            try {
                data = data["_embedded"]["venues"][0];
            }catch (e){
                res.status(200).send({});
            }
            try {
                venue["address"] = data["address"]["line1"];
            }catch (e){
                venue["address"] = null;
            }
            try {
                venue["city"] = data["city"]["name"];
            }catch (e){
                venue["city"] = null;
            }
            try {
                venue["state"] = data["state"]["name"];
            }catch (e){
                venue["state"] = null;
            }
            try {
                venue["name"] = data["name"];
            }catch (e){
                venue["name"] = null;
            }
            try {
                venue["tel"] = data["boxOfficeInfo"]["phoneNumberDetail"];
            }catch (e){
                venue["tel"] = null;
            }
            try {
                venue["openHour"] = data["boxOfficeInfo"]["openHoursDetail"];
            }catch (e){
                venue["openHour"] = null;
            }
            try {
                venue["generalRule"] = data["generalInfo"]["generalRule"];
            }catch (e){
                venue["generalRule"] = null;
            }
            try {
                venue["childRule"] = data["generalInfo"]["childRule"];
            }catch (e){
                venue["childRule"] = null;
            }

            res.status(200).send(venue);
        })
        .catch(function (error) {
            res.status(201).send(error.message);
        })
});

// Start the server
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;
