import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            required: true,
        },
        lastName: {
            type: String,
            trim: true,
            required: true,
        },
        country: {
            type: String,
            trim: true,
            required: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            required: true,
        },
        password: {
            type: String,
            trim: true,
            required: true,
        },
        noOfQuery: {
            type: Number,
            default: 0,
        },
        otp: {
            type: String,
            trim: true,
            default: null,
        },
        verified: {
            type: Boolean,
            trim: true,
            required: true,
            default: false,
        },
    },
    { timestamps: true }
);

export const userModel = mongoose.model("User", UserSchema);
