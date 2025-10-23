import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { Prisma, Activity } from 'generated/prisma';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // GET /activities?skip=0&take=10
  @Get()
  async getActivities(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: number,
  ): Promise<Activity[]> {
    return this.activitiesService.activities({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      cursor: cursor ? { activities_id: cursor } : undefined,
    });
  }

  // GET /activities/:id
  @Get(':id')
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  async getActivity(@Param('id') id: number): Promise<Activity | null> {
    return this.activitiesService.activity({ activities_id: Number(id) });
  }

  // POST /activities
  @Post()
  async createActivity(
    @Body() data: Prisma.ActivityCreateInput,
  ): Promise<Activity> {
    return this.activitiesService.createActivity(data);
  }

  // PATCH /activities/:id
  @Patch(':id')
  async updateActivity(
    @Param('id') id: number,
    @Body() data: Prisma.ActivityUpdateInput,
  ): Promise<Activity> {
    return this.activitiesService.updateActivity({
      where: { activities_id: Number(id) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
    });
  }

  // DELETE /activities/:id
  @Delete(':id')
  async deleteActivity(@Param('id') id: number): Promise<Activity> {
    return this.activitiesService.deleteActivity({ activities_id: Number(id) });
  }
}
