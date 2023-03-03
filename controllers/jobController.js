import slugify from 'slugify';
import { StatusCodes } from 'http-status-codes';

import Job from '../models/Job.js';
import APIFeatures from '../utils/apiFeatures.js';
import BadRequestError from '../errors/badRequest.js';
import NotFoundError from '../errors/notFound.js';
import asyncMiddleware from '../utils/asyncMiddleware.js';

export const getAllJobs = asyncMiddleware(async (req, res, next) => {
  const features = new APIFeatures(
    Job.find({ createdBy: req.user.id }),
    req.query
  )
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

export const getJob = asyncMiddleware(async (req, res, next) => {
  const {
    user: { id: userID },
    params: { id: jobID },
  } = req;

  const job = await Job.findOne({
    _id: jobID,
    createdBy: userID,
  });

  if (!job) {
    return next(new NotFoundError(`No job found with that ID: ${jobID}`));
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    job,
  });
});

export const getJobBySlug = asyncMiddleware(async (req, res, next) => {
  const {
    user: { id: userID },
    params: { slug },
  } = req;

  const job = await Job.findOne({
    slug: slug,
    createdBy: userID,
  });

  if (!job) {
    return next(new NotFoundError(`No job found with that SLUG: ${slug}`));
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    job,
  });
});

export const createJob = asyncMiddleware(async (req, res, next) => {
  if (!req.body.createdBy) req.body.createdBy = req.user.id;

  const job = await Job.create({ ...req.body });

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    job,
  });
});

export const updateJob = asyncMiddleware(async (req, res, next) => {
  const {
    user: { id: userID },
    params: { id: jobID },
    body: { company, position },
  } = req;

  if (company === '' || position === '') {
    return next(
      new BadRequestError('Company or Position fields cannot be empty')
    );
  }

  if (req.body.company) req.body.slug = slugify(req.body.company, { lower: true });

  const job = await Job.findOneAndUpdate(
    { _id: jobID, createdBy: userID },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!job) {
    return next(new NotFoundError(`No job found with that ID: ${jobID}`));
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    job,
  });
});

export const deleteJob = asyncMiddleware(async (req, res, next) => {
  const {
    user: { id: userID },
    params: { id: jobID },
  } = req;

  const job = await Job.findOneAndDelete({
    _id: jobID,
    createdBy: userID,
  });

  if (!job) {
    return next(new NotFoundError(`No job found with that ID: ${jobID}`));
  }

  res.status(StatusCodes.NO_CONTENT).json({
    status: 'success',
    job: null,
  });
});
