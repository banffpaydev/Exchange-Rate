import User from '../models/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { transporter, username } from './ExchangeRateService';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Use environment variable for security


class UserService {
  // Register a new user
  static async register(email: string, password: string, type: string) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const mailOptions = {
      from: `Exchange@bpay.africa`,
      to: email,
      subject: "Exchange Login Credentials",
      html: `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bpay Exchange Login Credentials</title>
    </head>
    <body style="background-color: #f9f9f9; font-family: Arial, sans-serif; margin: 0; padding: 20px;">
      <table align="center" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 5px; padding: 20px; border-collapse: collapse; color: #333;">
       
        <tr>
          <td style="padding: 20px;">
            <table width="100%">
              <tr>
                <td align="right">
                  <img src="https://res.cloudinary.com/djrjesruj/image/upload/v1730989966/logo_ppvfzy.png" alt="Bpay Logo" style="width: 80px;">
                </td>
              </tr>
            </table>
            <p>Dear User,</p>
            <p>Here are your login details:</p>
            <ul style="padding-left: 20px;">
              <li><strong>Email</strong>: ${email}</li>
              <li><strong>Password</strong>: ${password} </li>
              <li><strong>Login Link</strong>: <a href="https://exchange.bpay.africa/" style="color: #007BFF;">exchange.bpay.africa/</a></li>
            </ul>
            <p>Welcome aboard!</p>
  
            <p>Warmly,</p>
            <p>The Bpay Team</p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `,
    };
    const user = await User.create({ email, password, type: type || "user" });
    const info = transporter.sendMail(mailOptions);
    const userWithoutPassword = { ...user.toJSON() } as { password?: string };
    delete userWithoutPassword.password;

    return { token: this.generateToken(user), user: userWithoutPassword };
  }

  // Login a user
  static async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.checkPassword(password))) {
      throw new Error('Invalid credentials');
    }

    const userWithoutPassword = { ...user.toJSON() } as { password?: string };
    delete userWithoutPassword.password;

    return { token: this.generateToken(user), user: userWithoutPassword };
  }

  // Login a user
  static async getAllUsers() {
    const users = await User.findAll({});

    return users;
  }

  // Retrieve a specific user by ID
  static async getUserById(id: string) {
    try {
      const user = await User.findByPk(id); // Find user by primary key
      if (!user) {
        throw new Error('User not found');
      }
      const userWithoutPassword = { ...user.toJSON() } as { password?: string };
      delete userWithoutPassword.password;

      return userWithoutPassword;
    } catch (error: any) {
      throw new Error(`Error retrieving user: ${error.message}`);
    }
  }

  // Generate JWT token
  private static generateToken(user: User) {
    return jwt.sign(
      { id: user.id, email: user.email, type: user.type },
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
