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

});

const AdminModel = mongoose.model("admins",Admin);

module.exports = { AdminModel };