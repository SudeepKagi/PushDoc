import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        repository: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repository",
            required: true,
        },

        bullJobId: {
            type: String,
            required: true,
            unique: true,
        },

        commitSha: {
            type: String,
            required: true,
        },

        branch: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "QUEUED",
                "CLONING",
                "READING",
                "GENERATING",
                "WRITING",
                "COMMITTING",
                "PUSHING",
                "COMPLETED",
                "FAILED",
            ],
            default: "QUEUED",
        },

        startedAt: Date,

        completedAt: Date,

        duration: Number,

        error: String,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "Job",
    jobSchema
);