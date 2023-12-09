import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Notifications } from '../dto/notification.dto';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  @Input() notifications: Notifications[] = [];
  @Output() markAsRead = new EventEmitter<number>();
  constructor(private notificationService: NotificationService) { }

  markNotificationAsRead(id: number): void {
    this.notificationService.pickNotification(id).subscribe(
      (data) => {
        this.markAsRead.emit(id);
      },
      (error) => {
        console.error('Error marking notification as read', error);
      }
    );
  }
}
