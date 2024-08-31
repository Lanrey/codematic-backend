import { Model, ModelObject } from 'objection';

export class Video extends Model {
  static tableName = 'videos';

  id: string;
  videoId: string;
  title: string;
  description: string;
  viewCount: number;
  likeCount: number;
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
    const Comment = require('./comment.model');
    return {
      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comment,
        join: {
          from: 'videos.videoId',
          to: 'comments.videoId',
        },
      },
    };
  }
}

export type IVideo = ModelObject<Video>;
