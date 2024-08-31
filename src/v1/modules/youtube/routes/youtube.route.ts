import { FastifyPluginAsync } from 'fastify';
import YoutubeController from '../controllers/youtube.controller';
import { container } from 'tsyringe';
// import validate from '../../../../shared/middlewares/validator.middleware';
// import { loginRules, registerRules } from '../validations/admin.validation';

const youtubeController = container.resolve(YoutubeController);

const youtubeRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/video/details', {}, youtubeController.videoDetails);
  fastify.get('/video/comments', {}, youtubeController.videoComments);
};

export default youtubeRoute;
