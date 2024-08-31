import { injectable } from 'tsyringe';
import Redis from 'ioredis';
import { RedisClient } from '@shared/redis-client/redis-client';
//import logger from '@shared/utils/logger';
import YoutubeService from './youtube.service';

@injectable()
class HandleCommentService {
  private redisClient: Redis;

  constructor(
    redisClient: RedisClient,
    private readonly youtubeService: YoutubeService,
  ) {
    this.redisClient = redisClient.get();
  }

  async execute(data) {
    const { videoId, nextPageToken } = data;

   // console.log(`Processing comments for video ${videoId}:`, comments);
   // logger.info(`Processing comments for video ${videoId}:`, comments);

    if (nextPageToken) {
      await this.youtubeService.fetchVideoComments(videoId, nextPageToken);
    } else {
        await this.redisClient.set(`comments:${videoId}:status`, 'complete');
    }
  }
}

export default HandleCommentService;
