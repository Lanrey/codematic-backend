import 'reflect-metadata';
import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import YoutubeController from '../controllers/youtube.controller';
import YoutubeService from '../services/youtube.service';
import AppError from '../../../../shared/error/app.error';
import { SuccessResponse, ErrorResponse } from '../../../../shared/utils/response.util';

// Define the expected type for Querystring
interface VideoDetailsQuery {
  Querystring: {
    videoId: string;
  };
}

interface VideoCommentsQuery {
  Querystring: {
    videoId: string;
    perPage: number;
    page: number;
  };
}

describe('YoutubeController', () => {
  let youtubeController: YoutubeController;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let youtubeService: YoutubeService;

  beforeEach(() => {
    // Register mock dependencies in the container
    container.register<YoutubeService>('YoutubeService', {
      useClass: YoutubeService,
    });

    // Resolve the YoutubeService from the container
    youtubeService = container.resolve<YoutubeService>('YoutubeService');

    // Resolve the YoutubeController with the resolved YoutubeService
    youtubeController = new YoutubeController(youtubeService);

    mockRequest = {
      query: {},
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe('videoDetails', () => {
    it('should return video details successfully', async () => {
      const videoId = 'abc123';
      const videoDetailsMock = { title: 'Test Video', description: 'Test Description' };

      mockRequest.query = { videoId };

      jest.spyOn(youtubeService, 'fetchVideoDetails').mockResolvedValue(videoDetailsMock);

      await youtubeController.videoDetails(mockRequest as FastifyRequest<VideoDetailsQuery>, mockReply as FastifyReply);

      expect(youtubeService.fetchVideoDetails).toHaveBeenCalledWith(videoId);
      expect(mockReply.send).toHaveBeenCalledWith(
        SuccessResponse('Video Details retrieved successfully', videoDetailsMock),
      );
    });

    it('should handle AppError and return the correct error response', async () => {
      const videoId = 'abc123';
      const errorMessage = 'Video not found';
      const errorCode = 'VIDEO_NOT_FOUND';

      mockRequest.query = { videoId };

      const appError = new AppError(404, errorMessage, errorCode);
      jest.spyOn(youtubeService, 'fetchVideoDetails').mockRejectedValue(appError);

      await youtubeController.videoDetails(mockRequest as FastifyRequest<VideoDetailsQuery>, mockReply as FastifyReply);

      expect(youtubeService.fetchVideoDetails).toHaveBeenCalledWith(videoId);
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith(ErrorResponse(errorMessage, undefined, errorCode));
    });

    it('should handle unexpected errors and return 500 Internal Server Error', async () => {
      const videoId = 'abc123';

      mockRequest.query = { videoId };

      jest.spyOn(youtubeService, 'fetchVideoDetails').mockRejectedValue(new Error('Unexpected Error'));

      await youtubeController.videoDetails(mockRequest as FastifyRequest<VideoDetailsQuery>, mockReply as FastifyReply);

      expect(youtubeService.fetchVideoDetails).toHaveBeenCalledWith(videoId);
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith(ErrorResponse('Internal Server Error'));
    });
  });

  describe('videoComments', () => {
    it('should return video comments successfully', async () => {
      const videoId = 'abc123';
      const perPage = 10;
      const page = 1;

      const videoCommentsMock = {
        data: [
          {
            id: '4611d007-e832-4e2f-a16f-b7064aff3677',
            videoId: 'x2qvptp0tiw',
            text: 'If you went to school you would understand 😂😂😂',
            created_at: '2024-08-29T20:59:01.599Z',
            updated_at: '2024-08-29T20:59:01.599Z',
            commentId: 'UgwyaMNcu8piYQKRsK54AaABAg',
          },
        ],
        meta: {
          total: 5123,
          perPage: 100,
          totalPages: 52,
          page: 2,
        },
      };

      mockRequest.query = { videoId, perPage, page };

      jest.spyOn(youtubeService, 'fetchVideoComments').mockResolvedValue(videoCommentsMock);

      await youtubeController.videoComments(
        mockRequest as FastifyRequest<VideoCommentsQuery>,
        mockReply as FastifyReply,
      );

      expect(youtubeService.fetchVideoComments).toHaveBeenCalledWith(videoId, ' ', perPage, page);
      expect(mockReply.send).toHaveBeenCalledWith(
        SuccessResponse('Video Comments retrieved successfully', videoCommentsMock),
      );
    });

    it('should handle AppError and return the correct error response', async () => {
      const videoId = 'abc123';
      const perPage = 10;
      const page = 1;
      const errorMessage = 'Comments not found';
      const errorCode = 'COMMENTS_NOT_FOUND';

      mockRequest.query = { videoId, perPage, page };

      const appError = new AppError(404, errorMessage, errorCode);
      jest.spyOn(youtubeService, 'fetchVideoComments').mockRejectedValue(appError);

      await youtubeController.videoComments(
        mockRequest as FastifyRequest<VideoCommentsQuery>,
        mockReply as FastifyReply,
      );

      expect(youtubeService.fetchVideoComments).toHaveBeenCalledWith(videoId, ' ', perPage, page);
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith(ErrorResponse(errorMessage, undefined, errorCode));
    });

    it('should handle unexpected errors and return 500 Internal Server Error', async () => {
      const videoId = 'abc123';
      const perPage = 10;
      const page = 1;

      mockRequest.query = { videoId, perPage, page };

      jest.spyOn(youtubeService, 'fetchVideoComments').mockRejectedValue(new Error('Unexpected Error'));

      await youtubeController.videoComments(
        mockRequest as FastifyRequest<VideoCommentsQuery>,
        mockReply as FastifyReply,
      );

      expect(youtubeService.fetchVideoComments).toHaveBeenCalledWith(videoId, ' ', perPage, page);
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith(ErrorResponse('Internal Server Error'));
    });
  });
});
