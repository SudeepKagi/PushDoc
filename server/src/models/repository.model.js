import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema(
    {
        githubId: {
            type: Number,
            required: true,
            unique: true,
        },

        installation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Installation",
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
        },

        fullName: {
            type: String,
            required: true,
        },

        owner: {
            type: String,
            required: true,
        },

        private: {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Repository = mongoose.model(
    "Repository",
    repositorySchema
);

export default Repository;