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

userSchema.index(
    { firebaseUID: 1 },
    { unique: true, partialFilterExpression: { firebaseUID: { $exists: true, $ne: null } } }
);

const User = mongoose.model("User", userSchema);

module.exports = User