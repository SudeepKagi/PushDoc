import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        githubId: {
            type: Number,
            required: true,
            unique: true,
        },

        username: {
            type: String,
            required: true,
        },

        displayName: {
            type: String,
        },

        email: {
            type: String,
        },

        avatarUrl: {
            type: String,
        },

        githubAccessToken: {
            type: String,
            required: true,
        },

        provider: {
            type: String,
            default: "github",
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;