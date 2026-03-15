import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

/* INVITE MEMBER */
export const inviteMember = async (req, res) => {
  try {
    const { email, role, workspaceId, workspaceName } = req.body;

    const token = jwt.sign(
      { email, role, workspaceId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const inviteLink = `http://localhost:5173/join-workspace?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: `You're invited to ${workspaceName}`,
      html: `
        <h3>You have been invited to join ${workspaceName}</h3>
        <a href="${inviteLink}">Click here to join</a>
      `,
    });

    res.json({ message: "Invitation sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Invite failed" });
  }
};

/* JOIN WORKSPACE */
export const joinWorkspace = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, role, workspaceId } = decoded;

    const workspace = await Workspace.findById(workspaceId);
    const user = await User.findOne({ email });

    workspace.members.push({
      user: user._id,
      role,
    });

    await workspace.save();

    res.json({ message: "Joined successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired link" });
  }
};