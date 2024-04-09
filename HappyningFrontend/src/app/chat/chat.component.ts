import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { Message } from '../dto/message.dto';
import { Socket, io } from 'socket.io-client';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../services/event.service';
import { Event } from '../dto/event.dto';

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
  lastMessageSentTime: number = 0;
  currentLatency: number = 0;
  organizerId: number = 0;
  isOrganizer: boolean = false;
  adminLatency: number = 0;
  private socket: Socket | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.chatId = params['eventId'];
      const URL = `http://localhost:5001/chat?chatId=${this.chatId}`;
      this.socket = io(URL, {
        transports: ['websocket'],
        withCredentials: true,
        extraHeaders: {
          'Access-Control-Allow-Origin': 'http://localhost:4200'
        }
      });
      this.socket?.on('loadMessages', (messages: Message[]) => {
        this.messages = messages;
        console.log(this.messages);
        
      });
      this.socket?.on('newMessage', (message: any) => {
        this.messages.push(message);
      });
    });

    this.userService.whoAmI().subscribe((user) => {
      this.currentUser = user;
      this.getUserInfo();
    });
  }

  getUserInfo() {
    this.eventService.getEventById(this.chatId).subscribe((event: Event) => {
      this.organizerId = event.organizerId;

      if (+this.currentUser.id === this.organizerId) {
        this.isOrganizer = true;
      }
    });
  }

  changeLatency() {
    const currentTime = new Date().getTime();
    const message = {
      chat: this.chatId,
      user: {
        id: this.currentUser.id,
        username: this.currentUser.username
      },
      message: `The time delay has been changed to ${this.currentLatency} seconds`,
      createdAt: new Date(),
      latency: this.currentLatency
    };

    this.adminLatency = +this.currentLatency;
    this.newMessage = '';
    this.socket?.emit('writeMessage', message);
    this.lastMessageSentTime = currentTime;

    this._snackBar.open(`The time delay has been changed to ${this.currentLatency} seconds`, '', {
      duration: 3000,
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const currentTime = new Date().getTime();
      const timeSinceLastMessage = currentTime - this.lastMessageSentTime;

      for(let i = 0; i < this.messages.length; i++) {
        if (this.messages[i].user.id === this.organizerId) {
          this.adminLatency = this.messages[i].latency;
        }
      }

      if (timeSinceLastMessage >= (this.adminLatency * 1000)) {
        const message = {
          chat: this.chatId,
          user: {
            id: this.currentUser.id,
            username: this.currentUser.username
          },
          message: this.newMessage,
          createdAt: new Date(),
          latency: this.adminLatency
        };

        this.newMessage = '';
        this.socket?.emit('writeMessage', message);
        this.lastMessageSentTime = currentTime;
      } else {
        this._snackBar.open(`Wait ${this.adminLatency} seconds before sending a message`, '', {
          duration: 3000,
        });
      }
    }
  }
}
