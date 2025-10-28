import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/usersModel';
// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
// PUT /api/users/:id/profile
// Updates basic profile fields (userName, email)
export const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const { userName, email } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (email && email !== user.email) {
            const existing = await User.findOne({ email });
            if (existing && existing.id !== id) {
                return res.status(409).json({ message: 'Email already in use' });
            }
            user.email = email;
        }
        if (typeof userName === 'string' && userName.trim().length > 0) {
            user.userName = userName.trim();
        }
        await user.save();
        const userWithoutPassword = {
            id: user._id,
            userName: user.userName,
            email: user.email,
            image: user.image,
        };
        return res.json({ message: 'Profile updated', user: userWithoutPassword });
    }
    catch (error) {
        console.error('Update profile error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ message: 'Error updating profile', details: message });
    }
};
// PUT /api/users/:id/password
// Updates password after verifying currentPassword
export const updateUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        return res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Update password error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ message: 'Error updating password', details: message });
    }
};
// PUT /api/users/:id/image
// Updates user image (expects a data URL string or URL)
export const updateUserImage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const { image } = req.body;
        if (!image || typeof image !== 'string') {
            return res.status(400).json({ message: 'Image is required' });
        }
        // Basic sanity checks to avoid excessively large payloads
        if (image.startsWith('data:') && image.length > 2_000_000) { // ~2MB
            return res.status(413).json({ message: 'Image is too large' });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.image = image;
        await user.save();
        const userWithoutPassword = {
            id: user._id,
            userName: user.userName,
            email: user.email,
            image: user.image,
        };
        return res.json({ message: 'Image updated', user: userWithoutPassword });
    }
    catch (error) {
        console.error('Update image error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ message: 'Error updating image', details: message });
    }
};
