import express from 'express';

import * as authController from '../controllers/authController.js';
import * as authMiddleware from '../middlewares/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password/:token', authController.resetPassword);

router.use(authMiddleware.protect);

router.patch('/update-user-password', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);

router.patch('/update-user', userController.updateMe);

router.delete('/delete-user', userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(authMiddleware.restrictTo('admin'), userController.updateUser)
  .delete(authMiddleware.restrictTo('admin'), userController.deleteUser);

export default router;
