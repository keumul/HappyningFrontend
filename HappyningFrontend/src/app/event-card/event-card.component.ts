import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../services/category.service';
import { Category } from '../dto/category.dto';
import { Event } from '../dto/event.dto';
import { UserService } from '../services/user.service';
import { User } from '../dto/user.dto';
import { Notifications } from '../dto/notification.dto';
import { AuthService } from '../services/auth.service';
import { LocationService } from '../services/location.service';
import { Location } from '../dto/location.dto';
import { City } from '../dto/city.dto';
import { Country } from '../dto/country.dto';
import { Format } from '../dto/format.dto';
import { Complaint } from '../dto/complaint.dto';
import { ComplaintService } from '../services/complaint.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParticipantService } from '../services/participant.service';
import { switchMap } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { RegistrationService } from '../services/registration.service';
import { Participant } from '../dto/participant.dto';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css'],
})

export class EventCardComponent implements OnInit {
  event!: Event;
  userId!: number;
  category!: Category;
  format!: Format;
  organizer!: User;
  isOrganizer: boolean = false;
  notification!: Notifications[];
  auxDate!: Date;
  codeFromDatabase: string = '';
  isOverlayVisible: boolean = false;
  isMessage: boolean = false;
  message: string = '';
  enteredCode: string = '';
  qrCode: string = '';
  location!: Location;
  city!: City;
  country!: Country;
  complaintsCategory!: Complaint[];
  complaint!: number;
  isComplaint: boolean = false;
  isSecretCode: boolean = false;
  isAgeLimit: boolean = false;
  image: any;
  isCurrentUser: boolean = false;
  isRegistered: boolean = false;
  participant!: Participant;
  participants: number = 0;
  // participantsFullInfo: Participant[] = [];
  userDetails?: { [userId: number]: { username: string, email: string } } = {};

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private participantService: ParticipantService,
    private complaintService: ComplaintService,
    private _snackBar: MatSnackBar,
    private registrationService: RegistrationService
  ) { }

  async ngOnInit() {
    this.loadComplaintsCategory();
    var id = 0;
    this.route.params.subscribe(params => {
      id = params['eventId'];
    });
    this.userId = this.authService.getCurrentUser()?.id;
    this.loadLocationDetails(id);
    this.eventService.getEventById(id).subscribe((data: Event) => {
      this.event = data;
      this.auxDate = new Date(this.event.startDate);
      this.loadCategory();
      this.loadFormat();
      this.loadOrganizer();
      this.showPhoto();
      this.participantService
      .findAllEventParticipants(id)
      .pipe(switchMap(() => this.notificationService.findAllUserNotifications(this.userId)))
      .subscribe((data: Notifications[]) => {
        this.notification = data;
        this.updateQrCode(id);
      });

    this.findAllEventParticipants(id);
      if (this.userId === this.event.organizerId) {
        this.isOrganizer = true;
      } else if (!this.event.isPublic) {
        this.codeFromDatabase = this.event.secretCode;
        this.openOverlay("code");
      } 
      this.ageCheck();
      this.organizerIsBaned();
    });
  }

  loadCategory() {
    this.categoryService.findCategory(this.event.categoryId).subscribe((data: any) => {
      this.category = data as Category;
    })
  }

  loadFormat() {
    this.categoryService.findFormat(this.event.formatId).subscribe((data: any) => {
      this.format = data as Format;
    })
  }

  loadOrganizer() {
    this.userService.findUser(this.event.organizerId).subscribe((data: any) => {
      this.organizer = data as User;
    })
  }

  navigateToUserProfile(userId: number) {
    this.router.navigate([`user/${userId}`]);
  }

  findAllEventParticipants(event: number): void {
    this.participantService.findAllEventParticipants(event).subscribe(
      (response: any) => {
        this.participants = response.length;
        var participants = response;
        participants.forEach((participant: any) => {
          if (participant.userId === this.userId) {
            this.isRegistered = true;
          }
        });
      },
      (error) => {
        this.openSnackBar(error.error.message);
      }
    );
  }
  
  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 2000,
      panelClass: ['blue-snackbar']
    });
  }

  openOverlay(type: string) {
    if (type === "code") {
      this.isSecretCode = true;
      this.isAgeLimit = false;
    } else if (type==="age"){
      this.isAgeLimit = true;
      this.isSecretCode = false;
    }
    this.isOverlayVisible = true;
  }

  private updateQrCode(event: number): void {
    if (this.isRegistered) {
      const matchingNotification = this.notification.find((item) => {
        if (item.qrCode === null) return false;
        return item.eventId === +event;
      });

      if (matchingNotification) {
        this.qrCode = matchingNotification.qrCode;
        console.log('qr', matchingNotification.qrCode);
      } else {
        this.registrationService.qrCode = '';
      }
    } else {
      this.registrationService.qrCode = '';
    }
  }

  closeOverlay() {
    this.isOverlayVisible = false;
    this.enteredCode = '';
    this.router.navigate(['/home']);
  }

  closeSuccessOverlay() {
    this.isOverlayVisible = false;
    this.enteredCode = '';
  }

  onOverlaySubmit() {
    if (this.enteredCode === this.codeFromDatabase) {
      this.closeSuccessOverlay();
    }
  }

  loadComplaintsCategory() {
    this.complaintService.findAllComplaintsCategories().subscribe((data: Complaint[]) => {
      this.complaintsCategory = data;
    });
  }

  sendComplaint() {
    this.complaintService.createEventComplaint(this.event.id, this.complaint).subscribe(() => {
      this._snackBar.open('Complaint sent', '', {
        duration: 3000,
      });
    })
  }

  openComplaintDialog() {
    this.isComplaint = !this.isComplaint;
  }

  async loadLocationDetails(id: number) {
    try {
      const eventData = await new Promise<Event>((resolve, reject) => {
        this.eventService.getEventById(id).subscribe((data: Event) => {
          resolve(data);
        });
      });
      const locationId = eventData.locationId;
      
      this.location = await this.locationService.getLocationById(locationId).toPromise() as Location;
      this.city = await this.locationService.getCityById(this.location.cityId).toPromise() as City;
      this.country = await this.locationService.getCountryById(this.city.countryId).toPromise() as Country;
      return;
    } catch (error) {
      console.error('Error loading location details:', error);
      return null;
    }
  }

  showPhoto() {
    try {
      this.eventService.showImage(this.event.id).subscribe((data: any) => {
        this.image = data;
      });
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  organizerIsBaned() {
    this.userService.findUser(this.event.organizerId).subscribe((data: any) => {
      this.organizer = data as User;
      if (this.organizer.role == 'banned') {
        this.isMessage = true;
        this.message = 'This organizer is banned! This event may be deleted soon.';
      }
    });
  }

  ageCheck() {
    var today = new Date();
    this.userService.findUser(this.userId).subscribe((data: any) => {
      var birthdate = new Date(data.bday);
      var age = today.getFullYear() - birthdate.getFullYear();
      var monthDiff = today.getMonth() - birthdate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
      }
      if (age < this.event.ageLimit) {
        this.openOverlay('age');
      }
    });
  }
}
