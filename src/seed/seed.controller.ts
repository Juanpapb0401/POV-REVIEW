import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @ApiOperation({ summary: 'Run database seed' })
  @ApiResponse({ status: 200, description: 'Seed executed successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request'})
  executeSeed() {
    return this.seedService.runSeed();
  }
}
