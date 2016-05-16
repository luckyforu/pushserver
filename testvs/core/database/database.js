(function (database) {

    var q = require('q');
    var mongoose = require('mongoose'); 
    var dbConnectionString = 'mongodb://nishanth:nishanth@ds023078.mlab.com:23078/snacker';
    //var dbConnectionString = 'mongodb://localhost/snacker';
    mongoose.connect(dbConnectionString);
    var db = mongoose.connection;
    db.on('error', function (error) { 
        console.log("Unable to connect to DB " + error);
    });
    db.on('open', function () {
        console.log("connected to DB ");
    });
    
    //Schemas
    var deviceCollectionName = "Devices";
    var foodCollectionName = "Food";
    var deviceSchema = mongoose.Schema({
        deviceId : String
    });
    var SnackSchema = mongoose.Schema({
        //snack : object
    });
    var device = mongoose.model('device', deviceSchema, deviceCollectionName);
    var food = mongoose.model('foodItem', SnackSchema, foodCollectionName);
    
    database.registerDeviceId = function (deviceId) {
        var defer = q.defer();
        var dev = { deviceId : deviceId};
        var deviceToBeRegistered = new device(dev);
        deviceToBeRegistered.save(function (err, res) {
            if (err) {
                defer.reject(err);
            } else { 
                defer.resolve(res);
            }
        });
        return defer.promise;
    };
    
    database.unregisterDeviceId = function (deviceId) {
        var defer = q.defer();
        var dev = { deviceId : deviceId };
        device.remove(dev, (function (err, res) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(res);
            }
        }));
        return defer.promise;
    };
    
    database.getDeviceIds = function () {
        var defer = q.defer();
        device.find(function (err, res) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(res);
            }
        });
        return defer.promise;
    };

    database.getMenu = function (date) { 
        var defer = q.defer();
        food.findOne({ date: date}, function (err, res) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(res);
            }
        });
        return defer.promise;
    };
    

})(module.exports);