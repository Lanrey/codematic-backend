import { injectable } from 'tsyringe';
import { Video } from '../models/video.model';
import ObjectLiteral from '@shared/types/object-literal.type';
import DatabaseError from '@shared/error/database.error';

@injectable()
class VideoRepo {
  async insertVideo(data: ObjectLiteral) {
    try {
      return await Video.query().insert(data).onConflict('videoId').merge();
    } catch (error) {
      throw new DatabaseError('Video Repository - Error inserting into the database');
    }
  }

  async selectVideo(videoId: string) {
    try {
      return await Video.query().findOne('videoId', videoId);
    } catch (error) {
      throw new DatabaseError('Video Repository - Error retrieving from database');
    }
  }
}

export default VideoRepo;
