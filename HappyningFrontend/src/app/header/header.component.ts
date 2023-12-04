import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Notifications } from '../dto/notification.dto';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  notifications: Notifications[] = [];
  showNotifications = false;
  notificationCount = 0;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.findAllNotifications().subscribe(
      (data) => {
        this.notifications = Array.isArray(data) ? data : [];
        this.notificationCount = 0;

        for(let i = 0; i < this.notifications.length; i++) {
          if(this.notifications[i].isRead == false) {
            this.notificationCount++;
          }
        }
      },
      (error) => {
        console.error('Error loading notifications', error);
      }
    );
  }

  markAsRead(id: number): void {
    if(this.notificationCount > 0) {
      this.notificationCount--;
    }
    this.ngOnInit();
    console.log(`Marking notification ${id} as read`);
  }


  openNotifications(): void {
    this.loadNotifications();
    this.showNotifications = true;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }
}
