import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { Message } from '../dto/message.dto';
import { Socket, io } from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];
  newMessage: string = '';
  chatId: number = 0;
  currentUser: any;

  private socket: Socket | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.chatId = params['eventId'];
      const URL = `http://localhost:5001/chat?chatId=${this.chatId}`;
      this.socket = io(URL);
      this.socket?.on('loadMessages', (messages: Message[]) => {
        this.messages = messages;
      });

      this.socket?.on('newMessage', (message: any) => {
        this.messages.push(message);
      });

    });

    this.userService.whoAmI().subscribe((user) => {
      this.currentUser = user;
    })
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const message = {
        chat: this.chatId,
        user: {
          id: this.currentUser.id,
          username: this.currentUser.username
        },
        message: this.newMessage,
        createdAt: new Date()
      };

      console.log(message);

      this.newMessage = '';
      this.socket?.emit('writeMessage', message);
    }
  }

}
