const mongoose = require ('mongoose');

const Admin = new mongoose.Schema({
    adminName : {
        type : String,
        required : true
    },

    adminPassword : {
        type : String,
        required : true
    }, 

    userName:{
        type:String,
    },

    role : {
        type : String,
        required : true
    }, 

    roleId: {
        type : String,
        required : true
    }, 

    profile:{
        type:String,
    },

    signature:{
        type:String
    },

    // Optional: some deployments have a unique index on `mobile` in the admins collection
    // Define it so we can set a unique value on new documents (e.g., Staff) during seeding
    mobile: {
        type: String,
        default: null,
    },

});

const AdminModel = mongoose.model("admins",Admin);

module.exports = { AdminModel };