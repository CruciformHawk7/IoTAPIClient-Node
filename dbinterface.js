var mon;
var Device, Measure, Sample;

module.exports = {

    initialiseMongo: (mongoose) => {
        mon = mongoose;
        const {Schema} = mongoose;
        mongoose.connect('mongodb://localhost:27017/IoTProject', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        //Model for device
        Device = mongoose.model('device', {
            ID: String,
            Friendly: String,
            IP: String,
            DeviceType: String
        });

        //Model for data unit
        Measure = new Schema({
            ID: String,
            Measure: Number
        });

        //Model for data Storage
        Sample = mongoose.model('sample', {
            Time: { type: Date, default: Date.now },
            TotalUsage: Number,
            TotalProduction: Number,
            BatteryLevel: Number,
            Measures: [Measure]
        });
    },

    putDevice: async (json, query) => {
        if (json.ID == undefined) {
            throw Error("Missing ID");
        } else {
            var ep = await Device.findOne({ID: json.ID}).exec();
            if (ep != null) {
                throw Error("ID already exists.");
            } else {
                const newDevice = new Device({
                    ID: json.ID,
                    Friendly: query.Friendly,
                    IP: query.IP,
                    DeviceType: query.DeviceType
                });
                newDevice.save();
            }
        }
    },

    putSample: (tu, tp, bl, meas) => {
        let t = Date.now();
        const newSamp = new Sample({
            Time: t,
            TotalUsage: tu,
            TotalProduction: tp,
            BatteryLevel: bl,
            Measures: meas
        });
        newSamp.save();
    },

    getDevice: async (ID) => {
        return await Device.findOne({ID: ID}).exec();
    },

    getAllDeviceIPs: async() => {
        var res = await Device.find({}, 'IP DeviceType ID');
        return res;
    }
}