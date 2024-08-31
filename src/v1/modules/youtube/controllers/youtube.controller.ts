import { FastifyReply, FastifyRequest } from 'fastify';
import { injectable } from 'tsyringe';
import YoutubeService from '../services/youtube.service';
import AppError from '../../../../shared/error/app.error';
import DatabaseError from '@shared/error/database.error';
import { ErrorResponse, SuccessResponse } from '../../../../shared/utils/response.util';

@injectable()
class YoutubeController {
  constructor(private youtubeService: YoutubeService) {}

  videoDetails = async (req: FastifyRequest<{ Querystring: { videoId: string } }>, res: FastifyReply) => {
    try {
      const videoId = req.query.videoId;

      const videoDetails = await this.youtubeService.fetchVideoDetails(videoId);

      return res.send(SuccessResponse('Video Details retrieved successfully', videoDetails));
    } catch (error: any) {
      console.log(error);
      if (error instanceof AppError) {
        return res.status(error.statusCode).send(ErrorResponse(error.message, undefined, error.errorCode));
      }

      if (error instanceof DatabaseError) {
        return res.status(400).send(ErrorResponse(error.message));
      }
      return res.status(500).send(ErrorResponse('Internal Server Error'));
    }
  };

  videoComments = async (
    req: FastifyRequest<{ Querystring: { videoId: string; perPage: number; page: number } }>,
    res: FastifyReply,
  ) => {
    try {
      const videoId = req.query.videoId;
      const perPage = req.query.perPage;
      const page = req.query.page;
      const pageToken = ' ';
      const videoDetails = await this.youtubeService.fetchVideoComments(videoId, pageToken, perPage, page);

      return res.send(SuccessResponse('Video Comments retrieved successfully', videoDetails));
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).send(ErrorResponse(error.message, undefined, error.errorCode));
      }

      if (error instanceof DatabaseError) {
        return res.status(400).send(ErrorResponse(error.message));
      }

      return res.status(500).send(ErrorResponse('Internal Server Error'));
    }
  };
}

export default YoutubeController;
