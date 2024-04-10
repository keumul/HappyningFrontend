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
  enteredCode: string = '';
  qrCode: string = '';
  location!: Location;
  city!: City;
  country!: Country;
  complaintsCategory!: Complaint[];
  complaint!: number;
  isComplaint: boolean = false;
  
  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private complaintService: ComplaintService,
    private _snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    this.loadComplaintsCategory();
    var id = 0;
    this.route.params.subscribe(params => {
      id = params['eventId'];
    });
    this.userId = this.authService.getCurrentUser()?.id;
    this.loadLocationDetails(id);
    await this.eventService.getEventById(id).subscribe((data: Event) => {
      this.event = data;
      this.auxDate = new Date(this.event.startDate);
      this.loadCategory();
      this.loadOrganizer();
      if (this.userId === this.event.organizerId) {
        this.isOrganizer = true;
      }
      if (!this.event.isPublic) {
        this.codeFromDatabase = this.event.secretCode;
        this.openOverlay();
      }
    });
  }

  loadCategory() {
    this.categoryService.findCategory(this.event.categoryId).subscribe((data: any) => {
      this.category = data as Category;
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

  openOverlay() {
    this.isOverlayVisible = true;
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
      console.log('Right code!');
      this.closeSuccessOverlay();
    } else {
      console.log('Unvalid code!');
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


}
