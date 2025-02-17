import { Request, Response } from 'express';
import UserService from '../services/UserService';

class UserController {
  // Register a new user
  static async register(req: Request, res: Response) {
    const { email, password, type } = req.body;

    try {
      const cleanEmail = email?.toLowerCase()?.trim();
      const data = await UserService.register(cleanEmail, password, "user");
      return res.status(201).json({ message: 'User registered successfully', data });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Get all users
  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json({ message: 'successful', users });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
  // Login an existing user
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const cleanEmail = email?.toLowerCase()?.trim();

      const data = await UserService.login(cleanEmail, password);
      return res.status(200).json({ message: 'Login successful', data });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Get a  user
  static async getuser(req: any, res: Response) {
    const { id } = req.user;

    try {
      const data = await UserService.getUserById(id);
      return res.status(200).json({ message: 'Successful', data });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }


  }

  // update user type
  static async updateUserType(req: any, res: Response) {
    const { email, type } = req.body;

    try {
      const data = await UserService.updateUserTypeByEmail(email, type);
      return res.status(200).json({ message: 'Successful', data });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }


  }
}

export default UserController;
