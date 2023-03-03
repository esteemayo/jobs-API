import crypto from 'crypto';
import _ from 'lodash';
import { StatusCodes } from 'http-status-codes';

import User from '../models/User.js';
import AppError from '../errors/appError.js';
import sendEmail from '../utils/email.js';
import NotFoundError from '../errors/notFound.js';
import UnauthenticatedError from '../errors/unauthenticated.js';
import BadRequestError from '../errors/badRequest.js';
import createSendToken from '../utils/createSendToken.js';

export const register = asyncMiddleware(async (req, res, next) => {
  const userInputs = _.pick(req.body, [
    'name',
    'email',
    'role',
    'password',
    'confirmPassword',
    'passwordChangedAt',
  ]);

  const user = await User.create({ ...userInputs });

  createSendToken(user, StatusCodes.CREATED, req, res);
});

export const login = asyncMiddleware(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Please provide email and password'));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new UnauthenticatedError('Incorrect email or password'));
  }

  createSendToken(user, StatusCodes.OK, req, res);
});

export const forgotPassword = asyncMiddleware(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new NotFoundError(`There is no user with email address: ${email}`)
    );
  }

  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `
    Forgot your password? Submit a PATCH request with your new password and 
    confirmPassword to: ${resetURL}.\nIf you didn't forget your password, 
    please ignore this email!
  `;

  const html = `
    <h1>Hello ${user.firstName},</h1>
    <p>Forgot your password?</p>
    <p>
      Submit a PATCH request with your new password and 
      confirmPassword to: ${resetURL}.\nIf you didn't forget your password, 
      please ignore this email!
    </p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message,
      html,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: `Token sent to email → ${user.email}`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!')
    );
  }
});

export const resetPassword = asyncMiddleware(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new BadRequestError('Token is invalid or has expired'));
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  createSendToken(user, StatusCodes.OK, req, res);
});

export const updatePassword = asyncMiddleware(async (req, res, next) => {
  const { password, confirmPassword, currentPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new UnauthenticatedError('Your current password is wrong'));
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  await user.save();

  createSendToken(user, StatusCodes.OK, req, res);
});
