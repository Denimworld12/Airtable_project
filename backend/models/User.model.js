import mongoose from "mongoose";

const AirtableUserSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: {
        type: String
    },
    email: {
        type: String
    },

    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    },

    expiresAt: {
        type: Date
    },
    loginAt: {
        type: Date,
        default: Date.now
    },
});

const AirtableUser = mongoose.model("AirtableUser", AirtableUserSchema);
export default AirtableUser;