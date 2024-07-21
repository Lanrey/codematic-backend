import logger from '@shared/utils/logger';
class AppService {
  getHello() {
    logger.info('Sending message to APP Insights');
    return {
      service: '9jaPay base template',
      version: '1.0.0',
    };
  }
}

export default AppService;
