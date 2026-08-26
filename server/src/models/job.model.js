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
            index: true,
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
                "CANCELLED",
            ],
            default: "QUEUED",
        },

        startedAt: Date,

        completedAt: Date,

        duration: Number,

        error: String,

        originalReadme: String,

        generatedReadme: String,

        validationScore: Number,

        validationWarnings: [String],
    },
    {
        timestamps: true,
    }
);

// The stale-job reaper filters by status and a timestamp every 30 seconds.
// These indexes prevent that operational recovery path from scanning the
// entire jobs collection as production history grows.
jobSchema.index({ status: 1, createdAt: 1 });
jobSchema.index({ status: 1, updatedAt: 1 });
jobSchema.index({ repository: 1, createdAt: -1 });

export default mongoose.model(
    "Job",
    jobSchema
);
