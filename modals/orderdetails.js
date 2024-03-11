const mongoose = require('mongoose');

// Define the order details schema
const orderDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    streetAddress: {
        type: String,
        required: true
    },
    selectedState: {
        type: String,
        required: true
    },
    selectedDistrict: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Create the OrderDetails model
const OrderDetails = mongoose.model('OrderDetails', orderDetailsSchema);

module.exports = OrderDetails;
