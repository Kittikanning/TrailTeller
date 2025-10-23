import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { Prisma, Activity } from 'generated/prisma';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async activity(
    ActivityWhereUniqueInput: Prisma.ActivityWhereUniqueInput,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ): Promise<Activity | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.activity.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: ActivityWhereUniqueInput,
    });
  }

  async activities(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ActivityWhereUniqueInput;
    where?: Prisma.ActivityWhereInput;
    orderBy?: Prisma.ActivityOrderByWithRelationInput;
  }): Promise<Activity[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { skip, take, cursor, where, orderBy } = params;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.activity.findMany({
      skip,
      take,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      cursor,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      orderBy,
    });
  }

  async createActivity(data: Prisma.ActivityCreateInput): Promise<Activity> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.activity.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
    });
  }

  async updateActivity(params: {
    where: Prisma.ActivityWhereUniqueInput;
    data: Prisma.ActivityUpdateInput;
  }): Promise<Activity> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { where, data } = params;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.activity.update({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where,
    });
  }

  async deleteActivity(
    where: Prisma.ActivityWhereUniqueInput,
  ): Promise<Activity> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.activity.delete({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where,
    });
  }
}
