import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* INVITE MEMBER */
export const inviteMember = async (req, res) => {
  try {
    const { email, role, workspaceId, workspaceName } = req.body;
    if (!email || !workspaceId) {
      return res.status(400).json({ message: 'Email and workspaceId are required' });
    }

    const token = jwt.sign(
      { email, role: role || 'MEMBER', workspaceId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Uses env variable instead of hardcoded localhost
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${clientUrl}/join-workspace?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `You're invited to join ${workspaceName || 'a workspace'} on StackFlow`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #18181b;">You're invited! 🎉</h2>
          <p style="color: #52525b;">You've been invited to join <strong>${workspaceName || 'a workspace'}</strong> on StackFlow Manager as a <strong>${role || 'Member'}</strong>.</p>
          <a href="${inviteLink}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2563eb; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">Accept Invitation</a>
          <p style="color: #a1a1aa; font-size: 12px; margin-top: 24px;">This link expires in 24 hours.</p>
        </div>
      `,
    });

    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ message: 'Failed to send invite', error: error.message });
  }
};

/* JOIN WORKSPACE */
export const joinWorkspace = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, role, workspaceId } = decoded;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found. Please register first.' });

    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === user._id.toString()
    );
    if (alreadyMember) return res.status(400).json({ message: 'Already a member of this workspace' });

    workspace.members.push({ user: user._id, role: role || 'MEMBER' });
    await workspace.save();

    res.json({ message: 'Joined workspace successfully', workspaceId });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invite link has expired' });
    }
    res.status(400).json({ message: 'Invalid invite link' });
  }
};
