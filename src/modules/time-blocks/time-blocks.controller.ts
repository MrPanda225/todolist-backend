import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { TimeBlocksService }       from './time-blocks.service';
import {
  CreateTimeBlockSchema,
  UpdateTimeBlockSchema,
} from './dto/time-blocks.dto';
import type {
  CreateTimeBlockDto,
  UpdateTimeBlockDto,
} from './dto/time-blocks.dto';
import { ZodValidationPipe }       from '../../common/pipes/zod-validation.pipe';
import { CurrentUser }             from '../../common/decorators/current-user.decorator';
import type { JwtPayload }         from '../../common/decorators/current-user.decorator';

@Controller('time-blocks')
export class TimeBlocksController {
  constructor(private readonly timeBlocksService: TimeBlocksService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.timeBlocksService.findAll(user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.timeBlocksService.findOne(id, user.sub);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateTimeBlockSchema)) dto: CreateTimeBlockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.timeBlocksService.create(user.sub, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTimeBlockSchema)) dto: UpdateTimeBlockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.timeBlocksService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.timeBlocksService.delete(id, user.sub);
  }

  @Post(':id/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  assignTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.timeBlocksService.assignTask(id, taskId, user.sub);
  }

  @Delete(':id/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unassignTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.timeBlocksService.unassignTask(id, taskId, user.sub);
  }
}