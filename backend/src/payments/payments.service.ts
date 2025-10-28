import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { Payment, Prisma } from 'generated/prisma';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async payment(
    paymentWhereUniqueInput: Prisma.PaymentWhereUniqueInput,
  ): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: paymentWhereUniqueInput,
    });
  }

  async payments(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PaymentWhereUniqueInput;
    where?: Prisma.PaymentWhereInput;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
  }): Promise<Payment[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.payment.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPayment(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({
      data,
    });
  }

  async updatePayment(params: {
    where: Prisma.PaymentWhereUniqueInput;
    data: Prisma.PaymentUpdateInput;
  }): Promise<Payment> {
    const { where, data } = params;
    return this.prisma.payment.update({
      data,
      where,
    });
  }

  async deletePayment(where: Prisma.PaymentWhereUniqueInput): Promise<Payment> {
    return this.prisma.payment.delete({
      where,
    });
  }
}
