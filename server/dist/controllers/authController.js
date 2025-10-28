import User from '../models/usersModel';
import bcrypt from 'bcryptjs';
export const signup = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create new user
        const user = await User.create({
            userName,
            email,
            password: hashedPassword,
        });
        // Don't send password back
        const userWithoutPassword = {
            id: user._id,
            userName: user.userName,
            email: user.email,
            image: user.image,
        };
        res.status(201).json({
            message: 'User created successfully',
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Don't send password back
        const userWithoutPassword = {
            id: user._id,
            userName: user.userName,
            email: user.email,
            image: user.image,
        };
        res.status(200).json({
            message: 'Login successful',
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};
