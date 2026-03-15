import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    userAvatar: { type: String, default: "" }, 
    userName: { type: String, default: "User" }
}, { timestamps: true }); 

export default mongoose.model("Comment", commentSchema);