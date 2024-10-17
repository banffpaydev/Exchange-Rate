import User from '../models/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Use environment variable for security

class UserService {
  // Register a new user
  static async register(email: string, password: string) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const user = await User.create({ email, password });
    return this.generateToken(user);
  }

  // Login a user
  static async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.checkPassword(password))) {
      throw new Error('Invalid credentials');
    }
    return this.generateToken(user);
  }

  // Generate JWT token
  private static generateToken(user: User) {
    return jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' } // Token valid for 1 hour
    );
  }

  // Verify JWT token
  static verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
  }
}

export default UserService;
