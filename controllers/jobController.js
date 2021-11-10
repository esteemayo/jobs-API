const { StatusCodes } = require('http-status-codes');

const Job = require('../models/Job');
const APIFeatures = require('../utils/apiFeatures');
const NotFoundError = require('../errors/notFound');
const BadRequestError = require('../errors/badRequest');
const asyncMiddleware = require('../utils/asyncMiddleware');

exports.getAllJobs = asyncMiddleware(async (req, res, next) => {
    const features = new APIFeatures(Job.find({ 'createdBy': req.user.id }), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const jobs = await features.query;

    res.status(StatusCodes.OK).json({
        status: 'success',
        requestedAt: req.requestTime,
        nbHits: jobs.length,
        jobs,
    });
});

exports.getJob = asyncMiddleware(async (req, res, next) => {
    const {
        user: { id: userID },
        params: { id: jobID },
    } = req;

    const job = await Job.findOne({
        '_id': jobID,
        'createdBy': userID,
    });

    if (!job) {
        return next(new NotFoundError(`No job found with that ID: ${jobID}`));
    }

    res.status(StatusCodes.OK).json({
        status: 'success',
        job,
    });
});

exports.getJobBySlug = asyncMiddleware(async (req, res, next) => {
    const {
        user: { id: userID },
        params: { slug },
    } = req;

    const job = await Job.findOne({
        'slug': slug,
        'createdBy': userID,
    });

    if (!job) {
        return next(new NotFoundError(`No job found with that SLUG: ${slug}`));
    }

    res.status(StatusCodes.OK).json({
        status: 'success',
        job,
    });
});

exports.createJob = asyncMiddleware(async (req, res, next) => {
    if (!req.body.createdBy) req.body.createdBy = req.user.id;

    const job = await Job.create({ ...req.body });

    res.status(StatusCodes.CREATED).json({
        status: 'success',
        job,
    });
});

exports.updateJob = asyncMiddleware(async (req, res, next) => {
    const {
        user: { id: userID },
        params: { id: jobID },
        body: { company, position },
    } = req;

    if (company === '' || position === '') {
        return next(new BadRequestError('Company or Position fields cannot be empty'));
    }

    const job = await Job.findOneAndUpdate({ '_id': jobID, 'createdBy': userID }, req.body, {
        new: true,
        runValidators: true,
    });

    if (!job) {
        return next(new NotFoundError(`No job found with that ID: ${jobID}`));
    }

    res.status(StatusCodes.OK).json({
        status: 'success',
        job,
    });
});

exports.deleteJob = asyncMiddleware(async (req, res, next) => {
    const { user:
        { id: userID },
        params: { id: jobID },
    } = req;

    const job = await Job.findOneAndDelete({
        '_id': jobID,
        'createdBy': userID,
    });

    if (!job) {
        return next(new NotFoundError(`No job found with that ID: ${jobID}`));
    }

    res.status(StatusCodes.NO_CONTENT).json({
        status: 'success',
        job: null,
    });
});
