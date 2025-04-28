import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToNotifications')
  async handleSubscribe(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const room = `user-${userId}`;
    await client.join(room);
    console.log(`Client ${client.id} joined room ${room}`);
  }

  async sendNewNotification(userId: number, notification: any) {
    const room = `user-${userId}`;
    this.server.to(room).emit('new-notification', notification);
  }
}
