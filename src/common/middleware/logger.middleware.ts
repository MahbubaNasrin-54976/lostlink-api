import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const startTime = Date.now();
    response.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.log(
        `${request.method} ${request.originalUrl} ${response.statusCode} - ${duration}ms`,
      );
    });
    next();
  }
}