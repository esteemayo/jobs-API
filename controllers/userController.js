const _ = require('lodash');
const { StatusCodes } = require('http-status-codes');

const Job = require('../models/Job');
const User = require('../models/User');
const factory = require('./handlerFactory');
const BadRequestError = require('../errors/badRequest');
const asyncMiddleware = require('../utils/asyncMiddleware');

exports.updateMe = asyncMiddleware(async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (password || confirmPassword) {
        return next(new BadRequestError(`This route is not for password updates. Please use update ${req.protocol}://${req.get('host')}/api/v1/users/update-user-password`));
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

exports.deleteMe = asyncMiddleware(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, { active: false });
    await Job.deleteMany({ 'createdBy': user.id });

    res.status(StatusCodes.NO_CONTENT).json({
        status: 'success',
        user: null,
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.createUser = (req, res) => {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'fail',
        message: `This route is not defined! Please use ${req.protocol}://${req.get('host')}/api/v1/users/register instead`,
    });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// do NOT update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
