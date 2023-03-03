import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import UnauthenticatedError from '../errors/unauthenticated.js';

export const protect = asyncMiddleware(async (req, res, next) => {
  // getting token and check if it's there
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies.jwtToken) {
    token = req.cookies.jwtToken;
  }

  if (!token) {
    return next(
      new UnauthenticatedError(
        'You are not logged in! Please log in to get access'
      )
    );
  }

  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exists
  const currentUser = await User.findById(decoded.id).select('-password');

  if (!currentUser) {
    return next(
      new UnauthenticatedError(
        'The user belonging to this token does no longer exist'
      )
    );
  }

  // check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new UnauthenticatedError(
        'User recently changed password! Please log in again'
      )
    );
  }

  // grant access to protected routes
  req.user = currentUser;
  next();
});
