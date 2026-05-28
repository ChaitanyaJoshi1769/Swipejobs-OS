import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from './entities/notification.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async createNotification(
    userId: string,
    type: string,
    title: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      id: uuidv4(),
      user_id: userId,
      type,
      title,
      content,
      metadata,
      read: false,
    });
    return this.notificationsRepository.save(notification);
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const query = this.notificationsRepository
      .createQueryBuilder('notif')
      .where('notif.user_id = :userId', { userId });

    if (unreadOnly) {
      query.andWhere('notif.read = false');
    }

    return query
      .orderBy('notif.created_at', 'DESC')
      .take(50)
      .getMany();
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({ where: { id: notificationId } });
    if (notification) {
      notification.read = true;
      return this.notificationsRepository.save(notification);
    }
    throw new Error('Notification not found');
  }

  async sendMessage(conversationId: string, senderId: string, recipientId: string, content: string): Promise<Message> {
    const message = this.messagesRepository.create({
      id: uuidv4(),
      conversation_id: conversationId,
      sender_id: senderId,
      recipient_id: recipientId,
      content,
      read: false,
    });
    return this.messagesRepository.save(message);
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { conversation_id: conversationId },
      order: { created_at: 'ASC' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { user_id: userId, read: false },
    });
  }

  async sendBroadcast(userIds: string[], type: string, title: string, content: string): Promise<void> {
    const notifications = userIds.map(userId =>
      this.notificationsRepository.create({
        id: uuidv4(),
        user_id: userId,
        type,
        title,
        content,
        read: false,
      })
    );
    await this.notificationsRepository.save(notifications);
  }
}
