import { Model, ModelObject } from 'objection';

export class Comment extends Model {
  static tableName = 'comments';

  id: string;
  videoId: string;
  commentId: string;
  text: string;
  created_at: Date;
  updated_at: Date;

  $beforeInsert() {
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  $beforeUpdate() {
    this.updated_at = new Date();
  }

  static get relationMappings() {
    const Video = require('./video.model');
    return {
      video: {
        relation: Model.BelongsToOneRelation,
        modelClass: Video,
        join: {
          from: 'comments.videoId',
          to: 'videos.videoId',
        },
      },
    };
  }
}

export type IComment = ModelObject<Comment>;
