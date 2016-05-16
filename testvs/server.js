var express = require('express');
var gcm = require('node-gcm');
var app = express();
var q = require('q');
var CronJob = require('cron').CronJob;
var pushSnack = require('./Business/pushSnack');
var pushLunch = require('./Business/pushLunch');

var gcmApiKey = 'AIzaSyCT8xVXRCziuZEkV-Pn8seTKu8nALjqH7Q';
var database = require("./database");

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
    extended: true,
    keepExtensions: true,
    uploadDir: "uploads"
}));
app.use(bodyParser.json());

//var request = require('request');
//app.use(request());

pushLunch();
pushSnack();

var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
    console.log('server is just fine! running on port-' + port);
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var device_token;

app.get('/', function (req, res) {
    console.log("test");
    res.send("Hello all hi");
});

app.post('/register', function (req, res) {
    device_token = req.body.device_token;
    console.log(device_token);
    var promise = database.registerDeviceId(device_token);
    promise.then(function (data) {
        res.status(200).send("Registered device with Id" + data.deviceId);
    }, function (err) {
        res.status(500).send("Registering device failed " + err);
    });
});

app.post('/unregister', function (req, res) {
    device_token = req.body.device_token;
    console.log(device_token);
    var promise = database.unregisterDeviceId(device_token);
    promise.then(function (data) {
        res.status(200).send("Unregistered device");
    }, function (err) {
        res.status(500).send("Unregistering device failed " + err);
    });
});

app.get('/getMenu', function (req, res) {
    var date = req.param("date");
    var promise = database.getMenu(date);
    promise.then(function (data) {
        res.status(200).send(data);
    }, function (err) {
        res.status(500).send("Food items retreival failed " + err);
    });
});

app.get('/push', function (req, res) {
    
    var deviceIds;
    var device_tokens = []; //create array for storing device tokens
    var retry_times = 4; //the number of times to retry sending the message if it fails
    
    var sender = new gcm.Sender(gcmApiKey); //create a new sender
    var message = new gcm.Message(); //create a new message
    message.addData('title', 'PramatiSnacker');
    message.addData('message', "snack:Today's lunch are Vada Pav");
    message.addData('sound', 'default');
    //message.addData('type', 'lunch');
    
    message.collapseKey = 'Sancking'; //grouping messages
    message.delayWhileIdle = true; //delay sending while receiving device is offline
    message.timeToLive = 3; //the number of seconds to keep the message on the server if the device is offline
    
    var promise = database.getDeviceIds();
    promise.then(function (data) {
        deviceIds = data;
        for (i = 0; i < deviceIds.length; i++) {
            device_tokens.push(deviceIds[i].deviceId);
        }
        //device_tokens[0] = "dBCeiU6EctU:APA91bFDrSr7QZ8za3VslSG5WvG93GlfGBeZU8t_3Lvk-6xe6rGBjKLoFs3e756BXnE78pg7Dok9SzFjyk3D6DkD9HwZVPgLgk19MJswg3ONc09-xB_F7knY1o9hI15uDxJZn0WJPCtB";
        sender.send(message, device_tokens, retry_times, function (result) {
            console.log('push sent to: ' + device_tokens);
        });
        res.status(200).send('Pushed notification');
    }, function (err) {
        res.status(500).send('failed to push notification ' + err);
    });
    
});


