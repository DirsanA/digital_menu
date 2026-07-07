import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export const conversationService = {
  async findBySession(tenantId, sessionId) {
    return prisma.conversation.findFirst({
      where: { tenantId, sessionId },
    });
  },

  async findById(id, tenantId) {
    const conv = await prisma.conversation.findFirst({
      where: { id, tenantId },
    });
    if (!conv) throw new NotFoundError('Conversation');
    return conv;
  },

  async create(tenantId, sessionId) {
    return prisma.conversation.create({
      data: { tenantId, sessionId, messages: [] },
    });
  },

  async appendMessage(tenantId, sessionId, role, content) {
    let conv = await this.findBySession(tenantId, sessionId);
    if (!conv) {
      conv = await this.create(tenantId, sessionId);
    }

    const newMessage = { role, content, timestamp: new Date().toISOString() };
    const messages = [...(conv.messages || []), newMessage];

    return prisma.conversation.update({
      where: { id: conv.id },
      data: { messages },
    });
  },

  async delete(id, tenantId) {
    const result = await prisma.conversation.deleteMany({
      where: { id, tenantId },
    });
    if (result.count === 0) throw new NotFoundError('Conversation');
    return true;
  },
};
