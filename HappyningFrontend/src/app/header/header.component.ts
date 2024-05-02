import { Component, Input, OnInit } from '@angular/core';
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
  isModerator = false;
  currentUser!: User;
  @Input() location!: string;

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.userService.whoAmI().subscribe((user) => {
      this.currentUser = user;
      this.isAdmin = this.currentUser.role === 'admin';
      this.isModerator = this.currentUser.role === 'moderator';
      this.loadNotifications();
    });
  }

  loadNotifications() {
    this.notificationService.findAllUserNotifications(this.currentUser.id).subscribe(
      (data: Notifications) => {

        this.notifications = Array.isArray(data) ? data : [];
        this.notificationCount = 0;

        for (let i = 0; i < this.notifications.length; i++) {
          if (this.notifications[i].isRead == false && this.notifications[i].message.includes('You')) {
            this.notificationCount++;
          }
        }
      },
      (error) => {
        console.error('Error loading notifications', error);
      }
    );
  }

  openNotifications(): void {
    this.loadNotifications();
    this.showNotifications = true;
  }

  closeNotifications(): void {
    this.showNotifications = false;
    this.loadNotifications();
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
