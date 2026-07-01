import mongoose from "mongoose";

const installationSchema = new mongoose.Schema(
    {
        installationId: {
            type: Number,
            required: true,
            unique: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        accountLogin: {
            type: String,
        },

        accountType: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Installation", installationSchema);