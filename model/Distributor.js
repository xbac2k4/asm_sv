const mongoose = require('mongoose');

// khai báo food
const Distributor = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

const DistributorModel = mongoose.model('distributor', Distributor);

module.exports = DistributorModel;