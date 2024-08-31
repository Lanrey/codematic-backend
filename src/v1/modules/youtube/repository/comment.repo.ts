import { injectable } from 'tsyringe';
import { Comment } from '../models/comment.model';
import ObjectLiteral from '@shared/types/object-literal.type';
import { paginate } from '@shared/utils/pagination';
import DatabaseError from '@shared/error/database.error';

@injectable()
class CommentRepo {
  async insertComment(data: ObjectLiteral) {
    try {
      return await Comment.query().insert(data);
    } catch (error) {
      throw new DatabaseError('Comment Repository - Error inserting into the database');
    }
  }

  async getAll(videoId, perPage, page) {
    try {
      const queryBuilder = Comment.query().where('videoId', videoId);

      return await paginate<Comment>(queryBuilder, {
        size: Number(perPage || 10),
        page: Number(page || 1),
      });
    } catch (error) {
      throw new DatabaseError('Comment Repository - Error retrieving from the  database');
    }
  }
}

export default CommentRepo;
