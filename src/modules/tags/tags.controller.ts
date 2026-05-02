import {
  Controller, Get, Post, Delete,
  Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { TagsService }       from './tags.service';
import { CreateTagSchema }   from './dto/tags.dto';
import type { CreateTagDto } from './dto/tags.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser }       from '../../common/decorators/current-user.decorator';
import type { JwtPayload }   from '../../common/decorators/current-user.decorator';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.tagsService.findAll(user.sub);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateTagSchema)) dto: CreateTagDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tagsService.create(user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tagsService.delete(id, user.sub);
  }

  @Post(':id/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  assignToTask(
    @Param('id') tagId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tagsService.assignToTask(taskId, tagId, user.sub);
  }

  @Delete(':id/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unassignFromTask(
    @Param('id') tagId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tagsService.unassignFromTask(taskId, tagId, user.sub);
  }
}