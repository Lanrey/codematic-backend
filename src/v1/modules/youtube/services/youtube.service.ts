import { injectable, container } from 'tsyringe';
import Redis from 'ioredis';
import { RedisClient } from '@shared/redis-client/redis-client';
import appConfig from '@config/app.config';
import HTTPClient from '@shared/http-client/http-client';
import logger from '@shared/utils/logger';
import VideoRepo from '../repository/video.repo';
import CommentRepo from '../repository/comment.repo';
import { Comment } from '../models/comment.model';
import { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import PublishEvent from '../../common/event/services/publish-event-service';
import DatabaseError from '@shared/error/database.error';
import AppError from '@shared/error/app.error';

@injectable()
class YoutubeService {
  private redisClient: Redis;
  private youtubeServiceClient: AxiosInstance;
  private youtubeKey: string;
  private publishEvent: PublishEvent;
  private MAX_RETRIES: number;

  constructor(
    redisClient: RedisClient,
    private readonly videoRepo: VideoRepo,
    private readonly commentRepo: CommentRepo,
  ) {
    this.redisClient = redisClient.get();
    this.publishEvent = container.resolve(PublishEvent);
    this.youtubeKey = appConfig.youtube.apiKey.key;
    this.MAX_RETRIES = 5;
    this.youtubeServiceClient = HTTPClient.create({ baseURL: appConfig.youtube.apiKey.baseUrl });
  }

  private async fetchWithExponentialBackoff(url, retries = 0) {
    try {
      const response = await this.youtubeServiceClient.get(url);

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 429 && retries < this.MAX_RETRIES) {
        // If we hit a rate limit, wait and retry
        const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Rate limit hit. Retrying after ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.fetchWithExponentialBackoff(url, retries + 1);
      }
    }
  }

  async fetchVideoDetails(videoId: string) {
    // check cache first

    const cachedVideo = await this.redisClient.get(`video:${videoId}`);
    if (cachedVideo) {
      logger.info('Returning cache video details');
      console.log('Returning cache video details');

      return JSON.parse(cachedVideo);
    }

    try {
      const response = await this.fetchWithExponentialBackoff(
        `videos?id=${videoId}&part=snippet,statistics&key=${this.youtubeKey}`,
      );


      const videoData = response.items[0];

      if (!videoData) {
        throw new AppError(400, 'Invalid Video Id');
      }

      const videoDetails = {
        videoId: videoData.id,
        title: videoData.snippet.title,
        description: videoData.snippet.description,
        viewCount: videoData.statistics.viewCount,
        likeCount: videoData.statistics.likeCount,
      };

      await this.videoRepo.insertVideo(videoDetails);
      await this.redisClient.set(`video:${videoId}`, JSON.stringify(videoDetails));

      console.log('Video details saved to the database and cached.');
      logger.info('Video details saved to the database and cached.');

      return videoDetails;
    } catch (error: any) {
      console.log(error);
      throw new AppError(400, error);
    }
  }

  async getPaginatedCommentsFromCache(videoId: string, perPage: number = 50, page: number = 1) {
    const chunkSize = 100;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    let allComments = [];
    let chunkIndex = Math.floor(startIndex / chunkSize);

    while (allComments.length < endIndex) {
      const cachedChunk = await this.redisClient.get(`comments:${videoId}:chunk:${chunkIndex}`);
      if (cachedChunk) {
        allComments = allComments.concat(JSON.parse(cachedChunk));
      }
      chunkIndex++;
    }

    const paginatedComments = allComments.slice(startIndex, endIndex);
    return { comments: paginatedComments, nextPageToken: null };
  }

  async fetchVideoComments(videoId: string, pageToken = '', perPage?: number | undefined, page?: number) {
    const videoDetailsExist = await this.videoRepo.selectVideo(videoId);

    if (!videoDetailsExist) {
      throw new DatabaseError('Save Video Details First');
    }

    try {
      const response = await this.fetchWithExponentialBackoff(
        `commentThreads?videoId=${videoId}&part=snippet&maxResults=100&pageToken=${pageToken}&key=${this.youtubeKey}`,
      );

      // const comments = response.items.map((item) => item.snippet.topLevelComment.snippet.textDisplay);

      const comments = response.items.map((item) => ({
        commentId: item.id,
        videoId,
        text: item.snippet.topLevelComment.snippet.textDisplay,
      }));

      const nextPageToken = response.nextPageToken || null;

      // const commentRecords = comments.map((text) => ({ videoId, text }));

      const existingCommentIds = await Comment.query()
        .select('commentId')
        .whereIn(
          'commentId',
          comments.map((c) => c.commentId),
        );
      const existingCommentIdSet = new Set(existingCommentIds.map((c) => c.commentId));

      const newComments = comments.filter((c) => !existingCommentIdSet.has(c.commentId));

      if (newComments.length > 0) {
        await this.commentRepo.insertComment(newComments);
      }

      await this.publishEvent.execute({
        eventId: uuidv4(),
        type: 'load-more-comments',
        payload: { videoId, newComments, nextPageToken },
      });

      return await this.commentRepo.getAll(videoId, perPage, page);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default YoutubeService;
