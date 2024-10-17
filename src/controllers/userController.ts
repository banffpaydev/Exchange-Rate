import { Request, Response } from 'express';
import UserService from '../services/UserService';

class UserController {
  // Register a new user
  static async register(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const token = await UserService.register(email, password);
      return res.status(201).json({ message: 'User registered successfully', token });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Login an existing user
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const token = await UserService.login(email, password);
      return res.status(200).json({ message: 'Login successful', token });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default UserController;
