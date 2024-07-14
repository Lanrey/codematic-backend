import pino from 'pino';
import config from '../../../config/app.config';

const logger = pino({
  enabled: config.app.env !== 'test',
  mixin() {
    return {
      service: config.app.name,
    };
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        headers: req.headers,
        ip: req.ip,
        url: req.url,
        path: req.path,
        params: req.params,
        query: req.query,
        body: req.body,
      };
    },
    res(res) {
      return {
        statusCode: res.raw.statusCode,
        headers: res.getHeaders(),
        body: res.raw.payload,
      };
    },
    err(err) {
      return {
        id: err.id,
        type: err.type,
        code: err.code,
        message: err.message,
        stack: err.stack,
        details: err.details,
      };
    },
  },
  redact: [
    'req.headers.authorization',
    'res.body.data.banks',
    'req.body.picture',
    'req.body.pin',
    'req.body.confirmPin',
    'req.body.passcode',
  ],
});

export default logger;
