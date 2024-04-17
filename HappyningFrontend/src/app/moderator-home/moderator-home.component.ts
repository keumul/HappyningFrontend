import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { EventService } from '../services/event.service';
import { AuthService } from '../services/auth.service';
import { ComplaintService } from '../services/complaint.service';
import { User } from '../dto/user.dto';
import { Complaint } from '../dto/complaint.dto';
import { Event } from '../dto/event.dto';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-moderator-home',
  templateUrl: './moderator-home.component.html',
  styleUrls: ['./moderator-home.component.css']
})
export class ModeratorHomeComponent {

  isModerator: boolean = false;
  users: User[] = [];
  allComplaints: any[] = [];

  categories: Complaint[] = [];
  category!: Complaint;
  newCategory: Complaint = { id: 0, title: '', description: '' };
  isCreatingComplaint: boolean = false;
  isOpenComplaints: boolean = false;
  isEditingComplaint: boolean = false;

  isUsers: boolean = true;
  isBanned: { [userId: number]: boolean } = {};

  messagesComplaints: { [userId: number]: any } = {};
  eventsComplaints: { [userId: number]: any[] } = {};
  categoryComplaint: { [categoryId: number]: any } = {};
  eventComplaint: { [eventId: number]: any } = {};
  userComplaints: { [userId: number]: number } = {};
  isComplaintsList:{ [userId: number]: number } = {};

  events: any[] = [];
  currentEvent!: Event;
  currentLocation!: any;
  messages: any[] = [];
  isEventInfo = false;
  image!: string;

  constructor(
    private userService: UserService,
    private eventService: EventService,
    private complaintService: ComplaintService,
    private authService: AuthService,
    private locationService: LocationService) { }

  ngOnInit(): void {
    this.checkCredentials();
    this.loadUsers();
    this.loadComplaintsCategory();
    this.findUsersEventsComplaints();
    this.findUsersMessageComplaints();
    this.sortUsers('asc');
  }
  checkCredentials() {
    try {
      this.authService.getCurrentUser()?.role === 'moderator' ? this.isModerator = true : this.isModerator = false;
    } catch (error) {
      console.log(error);
    }
  }

  loadUsers() {
    this.users = [];
    this.userService.findAllUsers().subscribe(
      (data) => {
        for (let user of data) {
          (user.role === 'user' || user.role === 'banned') ? this.users.push(user) : null;
        }

        for (let user of this.users) {
          this.isBanned[user.id] = user.role === 'banned' ? true : false;
        }
      },
      (error) => {
        console.error('Error loading users', error);
      }
    );
  }

  loadComplaintsCategory() {
    this.complaintService.findAllComplaintsCategories().subscribe(
      (data) => {
        this.categories = data;
      },
      (error) => {
        console.error('Error loading complaints', error);
      }
    );
  }

  openComplaints(user: User) {
    this.isComplaintsList[user.id] = this.isComplaintsList[user.id] === undefined ? 0 : this.isComplaintsList[user.id];
    this.isComplaintsList[user.id] = this.isComplaintsList[user.id] === 0 ? 1 : 0;
  }

  createComplaintCategory(category: Complaint) {
    this.complaintService.createComplaintsCategory(this.newCategory).subscribe(
      (data) => {
        this.loadComplaintsCategory();
        this.isCreatingComplaint = false;
      },
      (error) => {
        console.error('Error creating complaint', error);
      }
    );
  }

  editComplaintCategory(category: Complaint) {
    this.complaintService.updateComplaintsCategory(category.id, category).subscribe(
      (data) => {
        this.loadComplaintsCategory();
        this.isEditingComplaint = false;
      },
      (error) => {
        console.error('Error editing complaint', error);
      }
    );
  }

  cancel() {
    this.isCreatingComplaint = false;
    this.isEditingComplaint = false;
  }

  deleteComplaintCategory(categoryId: number) {
    this.complaintService.removeComplaintsCategory(categoryId).subscribe(
      (data) => {
        this.loadComplaintsCategory();
      },
      (error) => {
        console.error('Error deleting complaint', error);
      }
    );
  }

  startCreatingComplaint() {
    this.isCreatingComplaint = !this.isCreatingComplaint;
  }

  startEditingComplaint() {
    this.isEditingComplaint = !this.isEditingComplaint;
    this.isCreatingComplaint = false;
  }

  openComplaintsCategory() {
    this.isOpenComplaints = true;
    this.isUsers = false;
  }

  openUsers() {
    this.isUsers = true;
    this.isOpenComplaints = false;
  }

  eventInfo(eventId: number) {
    this.isEventInfo = true;
    this.eventService.getEventById(eventId).subscribe(
      (data) => {
        this.currentEvent = data;
        this.locationInfo(data.locationId);
        this.showPhoto(data.id);
      },
      (error) => {
        console.error('Error loading event', error);
      }
    );
  }

  locationInfo(locationId: number) {
    this.locationService.getLocationById(locationId).subscribe(
      (data) => {
        this.locationService.getCityById(data.cityId).subscribe(
          (city) => {
            this.locationService.getCountryById(city.countryId).subscribe(
              (country) => {
                this.currentLocation = city.cityName + ', ' + country.countryName;
              },
              (error) => {
                console.error('Error loading country', error);
              }
            );
          },
          (error) => {
            console.error('Error loading city', error);
          }
        );
      },
      (error) => {
        console.error('Error loading location', error);
      }
    );
  }

  closeEventInfo() {
    this.isEventInfo = false;
  }

  findUsersMessageComplaints() {
    this.userService.findAllUsers().subscribe(
      (data) => {
        for (let user of data) {
          this.complaintService.findUserMessageComplaints(user.id).subscribe(
            (complaints) => {
              this.messagesComplaints[user.id] = complaints;

              if (complaints.length > 0) {
                if (this.userComplaints[user.id] === undefined) {
                  this.userComplaints[user.id] = 0;
                }
                this.userComplaints[user.id] += complaints.length;
              }
            },
            (error) => {
              console.error('Error loading complaints', error);
            }
          );
        }
      },
      (error) => {
        console.error('Error loading users', error);
      }
    );
  }

  findUsersEventsComplaints() {
    this.userService.findAllUsers().subscribe(
      (data) => {
        for (let user of data) {
          this.complaintService.findUserEventComplaints(user.id).subscribe(
            (complaints) => {
              this.eventsComplaints[user.id] = complaints;
              if (complaints.length > 0) {
                if (this.userComplaints[user.id] === undefined) {
                  this.userComplaints[user.id] = 0;
                }
                this.userComplaints[user.id] += complaints.length;
              }
            },
            (error) => {
              console.error('Error loading complaints', error);
            }
          );
        }
      },
      (error) => {
        console.error('Error loading users', error);
      }
    );
  }

  banUser(userId: number) {
    this.userService.banUser(userId).subscribe(
      (data) => {
        this.isBanned[userId] = true;
        this.loadUsers();
      },
      (error) => {
        console.error('Error banning user', error);
      }
    );
  }

  unbanUser(userId: number) {
    this.userService.unbanUser(userId).subscribe(
      (data) => {
        this.isBanned[userId] = false;
        this.loadUsers();
      },
      (error) => {
        console.error('Error unbanning user', error);
      }
    );
  }

  findEventComplaint(eventId: number) {
    this.complaintService.findEventComplaint(eventId).subscribe(
      (data) => {
        this.eventComplaint[eventId] = data;
      },
      (error) => {
        console.error('Error loading complaints', error);
      }
    );
  }

  showPhoto(eventId: number) {
    this.eventService.showImage(eventId).subscribe(
      (images) => {
        if (images.length > 0) {
          this.image = images;
        }
      },
      (error) => {
        console.error('Error loading images:', error);
      }
    );
  }

  deleteEvent(eventId: number) {
    this.eventService.removeEvent(eventId).subscribe(
      (data) => {
        this.loadUsers();
      },
      (error) => {
        console.error('Error deleting event', error);
      }
    );
  }

  deleteMessage(messageId: number) {
    this.eventService.deleteMessage(messageId).subscribe(
      (data) => {
        this.loadUsers();
        console.log('Message deleted');
        
      },
      (error) => {
        console.error('Error deleting message', error);
      }
    );
  }

  sortUsers(by: string) {
    if (by === 'asc') {
      this.users.sort((a, b) => {
        if (this.userComplaints[a.id] === undefined) {
          this.userComplaints[a.id] = 0;
        }
        if (this.userComplaints[b.id] === undefined) {
          this.userComplaints[b.id] = 0;
        }
        return this.userComplaints[b.id] - this.userComplaints[a.id];
      })
    }
    else if (by === 'desc') {
      this.users.sort((a, b) => {
        if (this.userComplaints[a.id] === undefined) {
          this.userComplaints[a.id] = 0;
        }
        if (this.userComplaints[b.id] === undefined) {
          this.userComplaints[b.id] = 0;
        }
        return this.userComplaints[a.id] - this.userComplaints[b.id];
      })
    }
  }
}
