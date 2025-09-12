const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },

    firebaseUID: {
        type: String,
        unique: true
    },
    friends: {
        type: [Object]
    },
    DOB: {
        type: Date,
    },
    provider: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: new Date()
    }
})

const User = mongoose.model("User", userSchema);

module.exports = User