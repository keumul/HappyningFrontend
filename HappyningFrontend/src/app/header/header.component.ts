import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Notifications } from '../dto/notification.dto';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../dto/user.dto';
import { UserService } from '../services/user.service';

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
  currentUser!: User;

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.userService.whoAmI().subscribe((user) => {
      this.currentUser = user;
      this.isAdmin = this.currentUser.isAdmin;
      this.loadNotifications();
    });
  }

  loadNotifications() {
    this.notificationService.findAllUserNotifications(this.currentUser.id).subscribe(
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
  }

  openNotifications(): void {
    this.loadNotifications();
    this.showNotifications = true;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  menuExitAccount() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  areYouSure() {
    if (confirm("Are you sure you want to log out?")) {
      this.menuExitAccount();
    }
  }
}
