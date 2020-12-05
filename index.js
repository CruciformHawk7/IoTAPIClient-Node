const express = require('express');
const app = express();
const bent = require('bent');
const cors = require('cors');
const mongoose = require('mongoose');
const { response } = require('express');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost:27017/IoTProject', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(cors());

//Model for device
const Device = mongoose.model('Device', {
    ID: String,
    Friendly: String,
    IP: String,
    DeviceType: String
});


//Model for data unit
const Measure = new Schema({
    ID: String,
    Measure: Number
});

//Model for data Storage
const Sample = mongoose.model('Sample', {
    Time: { type: Date, default: Date.now },
    TotalUsage: Number,
    TotalProduction: Number,
    BatteryLevel: Number,
    Measures: [Measure]
});


app.get('/Hello',(req, res) => {
    res.set('Content-Type', 'application/json');
    res.send('{"message":"Success"}');
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
            response = await request(req.query.IP);
            if (response.status == 200) {
                res.status(200);
                res.send('{ "message" : "success" }');
            } 
        } catch(err) {
            res.status(404);
            res.send('{ "message" : "Device not found." }');
        }
    }
});

app.use(express.static('public'));

console.log('Listening on port 3000');
app.listen(3000);