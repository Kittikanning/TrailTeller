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
import { PaymentsService } from './payments.service';
import { Prisma, Payment } from 'generated/prisma';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly PaymentsService: PaymentsService) {}

  // GET /payments?skip=0&take=10
  @Get()
  async getPayments(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: number,
  ): Promise<Payment[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.PaymentsService.payments({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      cursor: cursor ? { payment_id: cursor } : undefined,
    });
  }

  // GET /payments/:id
  @Get(':id')
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  async getPayment(@Param('id') id: number): Promise<Payment | null> {
    return await this.PaymentsService.payment({ payment_id: Number(id) });
  }

  // POST /payments
  @Post()
  async createPayment(
    @Body() data: Prisma.PaymentCreateInput,
  ): Promise<Payment> {
    return this.PaymentsService.createPayment(data);
  }

  // PATCH /payments/:id
  @Patch(':id')
  async updatePayment(
    @Param('id') id: number,
    @Body() data: Prisma.PaymentUpdateInput,
  ): Promise<Payment> {
    return this.PaymentsService.updatePayment({
      where: { payment_id: Number(id) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
    });
  }

  // DELETE /payments/:id
  @Delete(':id')
  async deletePayment(@Param('id') id: number): Promise<Payment> {
    return this.PaymentsService.deletePayment({ payment_id: Number(id) });
  }
}
