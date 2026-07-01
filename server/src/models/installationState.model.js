import mongoose from "mongoose";

const installationStateSchema = new mongoose.Schema(
    {
        state: {
            type: String,
            required: true,
            unique: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            expires: 0,
        },
    },
    {
        timestamps: true,
    }
);

const InstallationState = mongoose.model(
    "InstallationState",
    installationStateSchema
);

export default InstallationState;
