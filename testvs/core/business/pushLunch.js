var q = require('q');
var CronJob = require('cron').CronJob;
var gcm = require('node-gcm');

var gcmApiKey = 'AIzaSyCT8xVXRCziuZEkV-Pn8seTKu8nALjqH7Q';
var database = require("../database/database");

var job = new CronJob({
    cronTime: '00 00 19 * * 1-5',
    onTick: function () {
        /*
     * Runs every weekday (Monday through Friday)
     * at 11:30:00 AM. It does not run on Saturday
     * or Sunday.
     */
        var retry_times = 4;
        var pushData;
        var users;
        var dateObj = new Date();
        var date = dateObj.getDate().toString();
        var promise = database.getMenu(date);
        promise.then(function (data) {
            pushData = data;
            pushData._doc.type = "lunch";
            var sender = new gcm.Sender(gcmApiKey); //create a new sender
            var message = new gcm.Message(); //create a new message
            message = createPush(message, pushData);
            getUsers().then(function (data) {
                users = data;
                sender.send(message, users, retry_times, function (result) {
                    console.log('push sent to: ' + users);
                });
            }, function (err) {
                data = null;
            });
        
        }, function (err) {
            data = null;
        });
    },
    start: false,
    timeZone: 'Asia/Kolkata'
});

function createPush(message, data) {
    message.addData('title', 'Lunch @ Pramati');
    message.addData('message', "Today's lunch at pramati is .............fafasdfashfhfhajhfjadsfhadsjfadsfhjhdshafjsdfhjdsfhajfhashdjfhjashfjhasdjfhasjdfhjasdfhahfajfhajsdhfajhfjhdfhadjhfjdhfajfahfhadjhfajhfhjafhashfjhfjdhsfjhajhffadfafafsdjfhajshfjhasdjfhjasdhfjhdsjfhjasdhfjsdhfjhasdjfhajsdhfjadhsfjasfhjhjdhfjahsjhasdjhfjsdhfajsdhfjs...............................................................................");
    message.addData('sound', 'default');
    //message.addData('')
    data.type = "lunch";
    message.addData('additionalData', data);
    return message;
}

function getUsers() {
    var defer = q.defer();
    var device_tokens = [];
    var promise = database.getDeviceIds();
    promise.then(function (data) {
        var deviceIds = data;
        for (i = 0; i < deviceIds.length; i++) {
            device_tokens.push(deviceIds[i].deviceId);
        }
        defer.resolve(device_tokens);
    }, function (err) {
        defer.reject(null);
    });
    return defer.promise;
}

module.exports = function () {
    job.start();
};