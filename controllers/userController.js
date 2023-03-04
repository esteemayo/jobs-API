import _ from 'lodash';
import { StatusCodes } from 'http-status-codes';

import User from '../models/User.js';
import Job from '../models/Job.js';
import BadRequestError from '../errors/badRequest.js';
import factory from './handlerFactory.js';
import asyncMiddleware from '../utils/asyncMiddleware.js';

export const updateMe = asyncMiddleware(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (password || confirmPassword) {
    return next(
      new BadRequestError(
        `This route is not for password updates. Please use update ${req.protocol
        }://${req.get('host')}/api/v1/users/update-user-password`
      )
    );
  }

  const filterBody = _.pick(req.body, ['name', 'email']);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    user: updatedUser,
  });
});

export const deleteMe = asyncMiddleware(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  await Job.deleteMany({ createdBy: user.id });

  res.status(StatusCodes.NO_CONTENT).json({
    status: 'success',
    user: null,
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const createUser = (req, res) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'fail',
    message: `This route is not defined! Please use ${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/register instead`,
  });
};

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOneById(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
