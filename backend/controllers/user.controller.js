import User from '../models/User.js';

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id, { name, email }, { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) { next(err); }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted' });
  } catch (err) { next(err); }
};
