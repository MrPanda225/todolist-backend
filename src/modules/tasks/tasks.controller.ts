import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { TasksService }        from './tasks.service';
import { CreateTaskSchema }    from './dto/create-task.dto';
import type { CreateTaskDto }  from './dto/create-task.dto';
import { UpdateTaskSchema }    from './dto/update-task.dto';
import type { UpdateTaskDto }  from './dto/update-task.dto';
import { ZodValidationPipe }   from '../../common/pipes/zod-validation.pipe';
import { CurrentUser }         from '../../common/decorators/current-user.decorator';
import type { JwtPayload }     from '../../common/decorators/current-user.decorator';
import { TaskStatus }          from '../../generated/prisma';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.tasksService.findAll(user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.findOne(id, user.sub);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateTaskSchema)) dto: CreateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.create(user.sub, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTaskSchema)) dto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.update(id, user.sub, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.updateStatus(id, user.sub, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.delete(id, user.sub);
  }
}