import { Router } from 'express';
import UserController from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// User registration route
// @ts-ignore
router.post('/register', UserController.register);

// User login route
// @ts-ignore
router.post('/login', UserController.login);

// @ts-ignore
router.get('/users', UserController.getAll);

// @ts-ignore
router.get('/user', authenticateToken, UserController.getuser);
// @ts-ignore
router.post('/user-type', UserController.updateUserType);

export default router;
