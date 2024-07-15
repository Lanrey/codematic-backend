import 'dotenv/config';
import 'reflect-metadata';
import 'module-alias/register';
import App from './app';
import appConfig from './config/app.config';
import logger from './shared/utils/logger';
import appInsights from 'applicationinsights';

const app = new App();

appInsights.setup(appConfig.azureService.logs.connectionString).setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C).start()

process
  .on('uncaughtException', (err) => {
    logger.error({ err });
    app.close();
    process.exit(1);
  })
  .on('SIGINT', () => {
    app.close();
    process.exit(0);
  });

app
  .listen(appConfig.server.port)
  .then((address) => logger.info(`${appConfig.app.name} started on ${address}`))
  .catch((err) => {
    logger.error({ err });
    process.exit(1);
  });
