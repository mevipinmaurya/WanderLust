const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose")

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
    },
})

// below line will automatically create a "username" and "password" field
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);