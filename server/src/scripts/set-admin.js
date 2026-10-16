import "dotenv/config";
import mongoose from "mongoose";
import User from "../schema/user.schema.js";

const getMongoUri = () => process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  const uri = getMongoUri();
  if (!uri) {
    console.error(
      "❌ Error: Neither MONGO_URI nor MONGODB_URI is set in the environment.",
    );
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const action = args[0] || "--grant";
  const target = args[1] || process.env.ADMIN_GITHUB_USERNAMES || "SudeepKagi";

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(" Connected to MongoDB.\n");

    if (action === "--list") {
      const admins = await User.find({ admin: true })
        .select("githubUsername email githubId admin createdAt")
        .lean();

      const totalUsers = await User.countDocuments();
      console.log(`📋 Total Registered Users: ${totalUsers}`);
      console.log(`🛡️  Admin Users (${admins.length}):`);
      if (admins.length === 0) {
        console.log("   (No admin users found)");
      } else {
        admins.forEach((admin, idx) => {
          console.log(
            `   ${idx + 1}. ${admin.githubUsername || "Unknown"} [ID: ${admin.githubId || "N/A"}] - Email: ${admin.email || "N/A"}`,
          );
        });
      }
      return;
    }

    if (action === "--revoke") {
      if (!target) {
        console.error(
          "❌ Please specify a username or email to revoke: pnpm admin:revoke <username|email>",
        );
        process.exit(1);
      }

      const query = {
        $or: [
          { githubUsername: { $regex: new RegExp(`^${target}$`, "i") } },
          { email: target.toLowerCase() },
          { githubId: target },
        ],
      };

      const user = await User.findOne(query);
      if (!user) {
        console.error(`❌ User not found matching "${target}"`);
        process.exit(1);
      }

      user.admin = false;
      await user.save();
      console.log(
        `✅ Successfully revoked admin rights from @${user.githubUsername || user.email}`,
      );
      return;
    }

    // Default: grant admin
    const targets = target
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    for (const t of targets) {
      const query = {
        $or: [
          { githubUsername: { $regex: new RegExp(`^${t}$`, "i") } },
          { email: t.toLowerCase() },
          { githubId: t },
        ],
      };

      const user = await User.findOne(query);
      if (!user) {
        console.warn(
          `⚠️ User not found in database for "${t}". If they haven't logged in yet, admin will be applied upon first OAuth login.`,
        );
      } else {
        user.admin = true;
        await user.save();
        console.log(
          `✅ Granted admin privileges to @${user.githubUsername} (${user.email || "no email"}) [GitHub ID: ${user.githubId}]`,
        );
      }
    }
  } catch (error) {
    console.error("❌ Failed to update admin configuration:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();
