import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Notifications } from '../dto/notification.dto';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  notifications: Notifications[] = [];
  showNotifications = false;
  notificationCount = 0;
  isAdmin = false;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.loadNotifications();
    this.isAdmin = this.authService.getCurrentUser()?.isAdmin;
  }

  loadNotifications() {
    this.notificationService.findAllNotifications().subscribe(
      (data: Notifications) => {

        this.notifications = Array.isArray(data) ? data : [];
        this.notificationCount = 0;

        for (let i = 0; i < this.notifications.length; i++) {
          if (this.notifications[i].isRead == false) {
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
    if (this.notificationCount > 0) {
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

  menuExitAccount() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/auth']);
  }

  areYouSure() {
    if (confirm("Вы уверены, что хотите выйти?")) {
      this.menuExitAccount();
    }
  }
}
