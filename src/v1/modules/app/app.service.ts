import logger from '@shared/utils/logger';
import { injectable } from 'tsyringe';

@injectable()
class AppService {
  constructor() {}

  async getHello() {
    logger.info('Sending message to APP Insights');

    /*

    await this.publishEvent.execute({
      eventId: uuidv4(),
      type: 'test-asoro-template',
      payload: {
        message: 'Testing for chisels',
      },
    });

    */
    return {
      service: 'Codematic Video Commenter',
      version: '1.0.0',
    };
  }
}

export default AppService;
