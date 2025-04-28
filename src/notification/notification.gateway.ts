import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Разрешить любой фронтенд. Можно ограничить при необходимости
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendNewNotification(notification: any) {
    this.server.emit('new-notification', notification);
  }
}
