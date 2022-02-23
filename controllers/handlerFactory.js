const { StatusCodes } = require('http-status-codes');

const APIFeatures = require('../utils/apiFeatures');
const NotFoundError = require('../errors/notFound');
const asyncMiddleware = require('../utils/asyncMiddleware');

exports.getAll = (Model) =>
  asyncMiddleware(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const docs = await features.query.explain();
    const docs = await features.query;

    res.status(StatusCodes.OK).json({
      status: 'success',
      requestedAt: req.requestTime,
      nbHits: docs.length,
      docs,
    });
  });

exports.getOne = (Model, popOptions) =>
  asyncMiddleware(async (req, res, next) => {
    const { id: docID } = req.params;

    let query = Model.findById(docID);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID: ${docID}`)
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      doc,
    });
  });

exports.getSlug = (Model, popOptions) =>
  asyncMiddleware(async (req, res, next) => {
    const { slug } = req.params;

    let query = Model.findById(slug);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that SLUG: ${slug}`)
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      doc,
    });
  });

exports.createOne = (Model) =>
  asyncMiddleware(async (req, res, next) => {
    const doc = await Model.create({ ...req.body });

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      doc,
    });
  });

exports.updateOne = (Model) =>
  asyncMiddleware(async (req, res, next) => {
    const { id: docID } = req.params;

    const doc = await Model.findByIdAndUpdate(docID, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID: ${docID}`)
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      doc,
    });
  });

exports.deleteOne = (Model) =>
  asyncMiddleware(async (req, res, next) => {
    const { id: docID } = req.params;

    const doc = await Model.findByIdAndDelete(docID);

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID: ${docID}`)
      );
    }

    res.status(StatusCodes.NO_CONTENT).json({
      status: 'success',
      doc: null,
    });
  });
