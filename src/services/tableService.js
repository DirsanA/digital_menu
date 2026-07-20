import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';

export function transformTable(table) {
  return {
    id: table.id,
    tableNumber: table.tableNumber,
    number: table.tableNumber,
    capacity: table.capacity,
    isActive: table.isActive,
    qrCode: table.qrCode,
    createdAt: table.createdAt,
  };
}

function parseTableInput(data, { requireNumber = false } = {}) {
  const result = {};
  const rawNumber = data.tableNumber ?? data.number;

  if (rawNumber !== undefined && rawNumber !== null && rawNumber !== '') {
    const tableNumber = parseInt(rawNumber, 10);
    if (!Number.isInteger(tableNumber) || tableNumber < 1) {
      throw new ValidationError('Table number must be a positive whole number');
    }
    result.tableNumber = tableNumber;
  } else if (requireNumber) {
    throw new ValidationError('Table number is required');
  }

  if (data.capacity !== undefined && data.capacity !== null && data.capacity !== '') {
    const capacity = parseInt(data.capacity, 10);
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new ValidationError('Capacity must be at least 1');
    }
    result.capacity = capacity;
  }

  if (data.isActive !== undefined) {
    result.isActive = Boolean(data.isActive);
  }

  return result;
}

export const tableService = {
  async findByTenant(tenantId) {
    const tables = await prisma.table.findMany({
      where: { tenantId },
      orderBy: { tableNumber: 'asc' },
    });
    return tables.map(transformTable);
  },

  async findById(id, tenantId) {
    const table = await prisma.table.findFirst({ where: { id, tenantId } });
    if (!table) throw new NotFoundError('Table');
    return transformTable(table);
  },

  async create(tenantId, data) {
    const parsed = parseTableInput(data, { requireNumber: true });
    parsed.capacity ??= 4;

    const existing = await prisma.table.findUnique({
      where: { tenantId_tableNumber: { tenantId, tableNumber: parsed.tableNumber } },
    });
    if (existing) throw new ValidationError('Table number already exists');

    const table = await prisma.table.create({
      data: { tenantId, ...parsed },
    });
    return transformTable(table);
  },

  async update(id, tenantId, data) {
    const parsed = parseTableInput(data);
    if (Object.keys(parsed).length === 0) {
      return this.findById(id, tenantId);
    }

    if (parsed.tableNumber !== undefined) {
      const existing = await prisma.table.findFirst({
        where: { tenantId, tableNumber: parsed.tableNumber, id: { not: id } },
      });
      if (existing) throw new ValidationError('Table number already exists');
    }

    const result = await prisma.table.updateMany({
      where: { id, tenantId },
      data: parsed,
    });
    if (result.count === 0) throw new NotFoundError('Table');
    return this.findById(id, tenantId);
  },

  async delete(id, tenantId) {
    const result = await prisma.table.deleteMany({
      where: { id, tenantId },
    });
    if (result.count === 0) throw new NotFoundError('Table');
    return true;
  },
};
