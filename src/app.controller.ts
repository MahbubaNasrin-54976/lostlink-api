import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      service: 'LostLink Passenger Service',
      status: 'Running',
      timestamp: new Date().toISOString(),
    };
  }
}