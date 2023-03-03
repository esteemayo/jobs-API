import express from 'express';

import * as jobController from '../controllers/jobController.js';
import * as authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authController.protect);

router.get('/details/:slug', jobController.getJobBySlug);

router.route('/').get(jobController.getAllJobs).post(jobController.createJob);

router
  .route('/:id')
  .get(jobController.getJobById)
  .patch(jobController.updateJob)
  .delete(jobController.deleteJob);

export default router;
