const express = require('express');
const app = express();
const bent = require('bent');
const cors = require('cors');
const mongoose = require('mongoose');
const { Schema } = mongoose;
var dbinterface = require('./dbinterface');
const { getDevice } = require('./dbinterface');
dbinterface.initialiseMongo(mongoose);

app.use(cors());

/********* Calls from μC  *********/
var getDataFromDev = async (IP) => {
    try {
        let request = bent();
        let response = await request(IP);
        if (response.status == 200) {
            try {
                var json = await response.json();
                return json;
            } catch (err) {
                console.log(err);
            }
        }
    } catch (Err) {
        console.log(Err);
    }
}

var getAllData = async() => {
    var tu = 0, tp = 0, bl = 0, meas = [];
    var allDevices = await dbinterface.getAllDeviceIPs();
    for (let i = 0; i< allDevices.length; i++) {
        var r = await getDataFromDev(allDevices[i].IP);
        var p = {};
        p.ID = allDevices[i].ID;
        p.Measure = r.Measure;
        meas.push(p);
        if (allDevices[i].DeviceType == "Monitor") 
            bl = r.Measure;
        else if (allDevices[i].DeviceType == "Generator")
            tp += r.Measure;
        else tu += r.Measure;
    }
    await dbinterface.putSample(tu, tp, bl, meas);
}

/********* Calls from WebUI  *********/
app.get('/Hello',(req, res) => {
    res.set('Content-Type', 'application/json');
    res.send('{"message":"Success", "ID": "aabbcc"}');
});

app.post('/Add', async (req, res) => {
    res.set('Content-Type', 'application/json');
    if (req.query.Friendly == undefined 
     || req.query.IP == undefined 
     || req.query.DeviceType == undefined) {
        res.status(400);
        res.send('{ "error" : "Missing Parameters" }');
    } else if (req.query.DeviceType != 'Monitor' 
            && req.query.DeviceType != 'Generator'
            && req.query.DeviceType != 'Consumer'){
        res.status(400);
        res.send('{"error" : "Malformed DeviceType." }');
    } else {
        var response;
        try {
            let request = bent();
            response = await request(`${req.query.IP}`);
            if (response.status == 200) {
                try {
                    var json = await response.json();
                    await dbinterface.putDevice(json, req.query);
                    res.status(200);
                    res.send('{ "message" : "success" }');
                } catch (err) {
                    res.status(500);
                    res.send(`{ "message" : ${err.message} }`);
                }
            } 
        } catch(err) {
            res.status(404);
            res.send('{ "message" : "Device not found." }');
        }
    }
});

/********* Test routes *********/
app.get('/TestData1', async (req, res) => {
    let val = Math.floor(Math.random() * Math.floor(95));
    res.set('Content-Type', 'application/json');
    res.send(`{"ID":"aab", "Measure":${val} }`);
});
app.get('/TestData2', async (req, res) => {
    let val = Math.floor(Math.random() * Math.floor(95));
    res.set('Content-Type', 'application/json');
    res.send(`{"ID":"aabc", "Measure":${val} }`);
});
app.get('/TestData3', async (req, res) => {
    let val = Math.floor(Math.random() * Math.floor(95));
    res.set('Content-Type', 'application/json');
    res.send(`{"ID":"dde", "Measure":${val} }`);
});
app.get('/TestData4', async (req, res) => {
    let val = Math.floor(Math.random() * Math.floor(95));
    res.set('Content-Type', 'application/json');
    res.send(`{"ID":"cac", "Measure":${val} }`);
});
app.get('/TestData5', async (req, res) => {
    let val = Math.floor(Math.random() * Math.floor(95));
    res.set('Content-Type', 'application/json');
    res.send(`{"ID":"abc", "Measure":${val} }`);
});

app.post('/TestGetData', async (req, res) => {
    console.log(getDataFromDev(req.query.IP));
});

getAllData();

console.log('Listening on port 3000');
app.listen(3000);