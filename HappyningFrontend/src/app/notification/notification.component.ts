import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Notifications } from '../dto/notification.dto';
import { NotificationService } from '../services/notification.service';
import { EventService } from '../services/event.service';
import { UserService } from '../services/user.service';
import { PreferenceService } from '../services/preference.service';
import { CategoryService } from '../services/category.service';
import { Event } from '../dto/event.dto';
import { User } from '../dto/user.dto';
import { Router } from '@angular/router';
import { Category } from '../dto/category.dto';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  @Input() notifications: Notifications[] = [];
  @Input() location!: string;
  @Output() markAsRead = new EventEmitter<number>();

  images: { [eventId: number]: string } = {};

  events: Event[] = [];
  uniqueEvents: Notifications[] = [];
  preferences: any[] = [];
  preferencesEvents: Event[] = [];
  categoryScore: { [categoryId: number]: number } = {};
  bestCategories: number[] = [];
  bestFormats: number[] = [];
  formatScore: { [formatId: number]: number } = {};
  bestCategoryScore: number = 0;
  bestFormatScore: number = 0;
  currentUser!: User;
  categoryInfo: { [categoryId: number]: any } = {};
  eventInfo: { [eventId: number]: any } = {};
  limit: number = 0;
  isNotificationOpen: boolean = true;

  phrases = ["You might like this event on the topic ",
    "You will like this event on the topic ",
    "You will love this event, because it is about ",
    "You might be interested in this event on the topic "];
  phrase: string = '';

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private eventService: EventService,
    private userService: UserService,
    private preferenceService: PreferenceService,
    private categoryService: CategoryService,
    private matSnackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.limit = 0;
    this.userService.whoAmI().subscribe((user) => {
      this.currentUser = user;
    });
    this.loadAllEvents();
  }

  loadAllEvents() {
    this.events = [];
    this.eventService.getAllEvents().subscribe(
      (data: Event[]) => {
        for (let event of data) {
          if (event.organizerId !== this.currentUser.id) {
              this.events.push(event);
          }
        }
        this.loadPreferences();
      },
      (error) => {
        console.error('Error loading events', error);
      }
    );
  }

  loadPreferences() {
    this.preferenceService.sortedCategoriesPreference(this.currentUser.id).subscribe(
      (data) => {
        const count30Percent = Math.ceil(data.length * 0.3);
        const startIndex = data.length - count30Percent;
        const last30Percent = data.slice(startIndex);
        this.preferences = last30Percent;
        this.loadEventsByPreferences();
      },
      (error) => {
        console.error('Error loading preferences', error);
      }
    );

    this.preferenceService.sortedFormatsPreference(this.currentUser.id).subscribe(
      (data) => {
        const count30Percent = Math.ceil(data.length * 0.3);
        const startIndex = data.length - count30Percent;
        const last30Percent = data.slice(startIndex);
        this.preferences = this.preferences.concat(last30Percent);
        this.loadEventsByPreferences();
      },
      (error) => {
        console.error('Error loading preferences', error);
      }
    );
  }

  loadEventsByPreferences() {
    this.preferencesEvents = [];
    for (let event of this.events) {
      for (let i = 0; i < this.preferences.length; i++) {
        if ((event.categoryId == this.preferences[i] || event.formatId == this.preferences[i])) {
          this.preferencesEvents.push(event);
          this.loadCategoryById(event.categoryId);
          this.loadEventById(event.id);
        }
      }
    }
  }

  randomEventByPreferences() {
    if (this.preferencesEvents.length > 0) {
      const event = this.preferencesEvents[Math.floor(Math.random() * this.preferencesEvents.length)];
      console.log(event);
      
      var chance = Math.floor(Math.random() * 5);
      if (chance === 1) {
        this.sendNotification(event.id, this.currentUser.id);
        this.loadUserNotifications();
      }
      this.loadUserNotifications();
    } else {
      return;
    }
  }

  loadCategoryById(categoryId: number) {
    this.categoryService.findCategory(categoryId).subscribe(
      (data: Category) => {
        this.categoryInfo[categoryId] = data;
        if (this.limit === 0) {
          this.randomEventByPreferences();
          this.limit++;
        }
      },
      (error) => {
        console.error('Error loading category', error);
      }
    );
  }

  loadEventById(eventId: number) {
    this.eventService.getEventById(eventId).subscribe(
      (data: Event) => {
        this.eventInfo[eventId] = data;
      },
      (error) => {
        console.error('Error loading event', error);
      }
    );
  }

  randomPhrase() {
    return this.phrases[Math.floor(Math.random() * this.phrases.length)];
  }

  redirectToEvent(eventId: number) {
    this.router.navigate([`event/${eventId}`]);
  }

  sendNotification(eventId: number, userId: number) {
    this.eventService.getEventById(eventId).subscribe((event: Event) => {
      this.notificationService.createNotification(eventId, userId, {
        message: this.phrases[Math.floor(Math.random() * this.phrases.length)] + this.categoryInfo[event.categoryId].title,
        isRead: false
      }).subscribe(
        (data) => {
          console.log('Notification sent', data);
        },
        (error) => {
          console.error('Error sending notification', error);
        }
      );
    });
  }

  deleteNotification(id: number): void {
    this.notificationService.deleteNotification(id).subscribe(
      (data) => {
        this.loadUserNotifications();
      },
      (error) => {
        this.matSnackBar.open('Waiting please...', '', { duration: 2000 });
        console.error('Error deleting notification', error);
      }
    );
  }

  loadUserNotifications(): void {
    this.notifications = [];
    this.notificationService.findAllUserNotifications(this.currentUser.id).subscribe(
      (data: Notifications[]) => {
        for (let notification of data) {
          if (notification.message.includes('You')) {
            if (new Date(this.eventInfo[notification.eventId].startDate) > new Date()) {
            this.notifications.push(notification);
            }
          }
        }
        this.notifications = this.notifications.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })

        this.uniqueEvents = this.notifications.filter((thing, index, self) =>
          index === self.findIndex((t) => (
            t.eventId === thing.eventId
          ))
        );
        this.showPhotos(this.uniqueEvents);
      },
      (error) => {
        console.error('Error loading user notifications', error);
      }
    );
  }

  markNotificationAsRead(id: number): void {
    this.notificationService.pickNotification(id).subscribe(
      (data) => {
        this.markAsRead.emit(id);
        this.loadUserNotifications();
      },
      (error) => {
        console.error('Error marking notification as read', error);
      }
    );
  }

  showPhotos(events: Notifications[]) {
    try {
      for (let event of events) {
        this.eventService.showImage(event.eventId).subscribe((data) => {
          this.images[event.eventId] = data;
        })
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  closeNotifications(): void {
    this.isNotificationOpen = false;
  }
}
