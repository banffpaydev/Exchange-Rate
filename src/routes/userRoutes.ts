import { Router } from 'express';
import UserController from '../controllers/userController';

const router = Router();

// User registration route
// @ts-ignore
router.post('/register', UserController.register);

// User login route
// @ts-ignore
router.post('/login', UserController.login);

export default router;
