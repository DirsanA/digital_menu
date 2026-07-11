import { prisma } from '@/lib/prisma';

export const reportService = {
  async salesReport(tenantId, dateFrom, dateTo) {
    const where = { tenantId };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const orders = await prisma.order.findMany({
      where: { ...where, status: { not: 'cancelled' } },
      orderBy: { createdAt: 'asc' },
    });

    const totalRevenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const totalOrders = orders.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, avgTicket, orders };
  },

  async dailyRevenue(tenantId, date) {
    const start = new Date(date || new Date());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: start, lt: end },
        status: { not: 'cancelled' },
      },
    });

    return {
      date: start,
      revenue: orders.reduce((s, o) => s + Number(o.totalAmount), 0),
      orderCount: orders.length,
    };
  },

  async expensesSummary(tenantId, dateFrom, dateTo) {
    const where = { tenantId };
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const expenses = await prisma.expense.findMany({ where });
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {});

    return { totalExpenses, byCategory, count: expenses.length };
  },

  async taxSummary(tenantId, dateFrom, dateTo) {
    const where = { tenantId };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const invoices = await prisma.invoice.findMany({
      where: { ...where, status: 'paid' },
    });

    const totalTax = invoices.reduce((s, i) => s + Number(i.tax), 0);
    const totalRevenue = invoices.reduce((s, i) => s + Number(i.amount), 0);

    return { totalTax, totalRevenue, invoiceCount: invoices.length };
  },
};
