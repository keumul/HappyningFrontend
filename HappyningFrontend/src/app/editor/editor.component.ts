import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Event } from '../dto/event.dto';
import { CategoryService } from '../services/category.service';
import { Category } from '../dto/category.dto';
import { Format } from '../dto/format.dto';
import * as moment from 'moment';
import { NotificationService } from '../services/notification.service';
import { Country } from '../dto/country.dto';
import { City } from '../dto/city.dto';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  auxId!: number;
  event!: Event;
  events!: any[];

  category!: Category;
  categories: Category[] = [];
  subcategories: Category[] = [];

  format!: Format;
  formats!: Format[];

  auxDate!: Date;
  startDate!: string;
  endDate!: string;
  newDate!: Date;

  selectedEvent!: Event;
  accessLevel: string = 'Public';
  canCheck = true;
  isEventsListOpen = false;
  isSubcategoriesOpen = false;

  countryId!: number;
  countries!: Country[];
  cityId!: number;
  cities!: City[];
  address!: string;
  locations!: { id: number, details: string, cityId: number }[];
  
  isPrivate = true;
  isPublic = true;
  limit = 0;

  message!: string;
  errorMessage!: string;
  successMessage!: string;
  isErrorMessage = false;
  isSuccessMessage = false;

  constructor(private eventService: EventService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private notificationService: NotificationService,
    private locationService: LocationService) { }

  ngOnInit(): void {
    this.limit = 0;
    this.canCheck = true;
    let userId = this.authService.getCurrentUser()?.id;
    this.eventService.getUserEvents(userId).subscribe(data => {
      this.events = data;
      if (this.events.length > 0) {
        this.onSelectEvent(this.events[0]);
      } else {
        this.onSelectEvent({
          id: this.auxId,
          title: '',
          description: '',
          startDate: new Date(0),
          endDate: new Date(0),
          locationId: 1,
          organizerId: this.authService.getCurrentUser()?.id,
          categoryId: 1,
          formatId: 1,
          ageLimit: 21,
          maxGuestAmount: 100,
          isPublic: true,
        });
      }
      this.clearInput();
    });

    this.auxId = this.events.length + Math.random() * 10000;
    this.loadCategories();
    this.loadSubcategories(1);
    this.loadFormats();
    this.loadCountries();
    this.loadCities();
    this.loadLocations();

    if (this.selectedEvent.isPublic) {
      this.accessLevel = 'Public';
    } else {
      this.accessLevel = 'Private';
    }
  }

  openEventsList() {
    this.isEventsListOpen = !this.isEventsListOpen;
  }

  onSelectEvent(event: any) {
    this.canCheck = false;
    this.selectedEvent = event;
    this.auxDate = new Date(this.selectedEvent.startDate);
    this.startDate = moment().format('YYYY.MM.DD HH:MM');
    this.loadCategory(this.selectedEvent.categoryId);
    this.loadFormat(this.selectedEvent.formatId);
    this.loadCategories();
    this.loadSubcategories(this.selectedEvent.categoryId);
    this.loadFormats();
    this.loadCountries();
    this.loadCities();
    this.loadLocations();
    if (this.selectedEvent && this.selectedEvent.isPublic) {
      this.accessLevel = 'Public';
    } else {
      this.accessLevel = 'Private';
    }
  }

  redirectToEvent(eventId: number) {
    this.router.navigate([`event/${eventId}`]);
  }

  loadCategory(id: number) {
    this.categoryService.findCategory(id).subscribe((data: any) => {
      this.category = data;
    })
  }

  loadCategories() {
    this.categoryService.findAllCategories().subscribe((data: any) => {
      if (this.limit < 1) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].parentId == null) {
            this.categories.push(data[i]);
          }
        }
        this.limit++;
      }
    });
  }

  loadLocations() {
    this.locationService.getAllLocations().subscribe((data: any) => {
      this.locations = data;
    })
  }

  loadSubcategories(id: number) {
    this.categoryService.findSubcategories(id).subscribe((data: any) => {

      if (data.length > 0) {
        this.subcategories = data;
        this.isSubcategoriesOpen = true;
      } else {
        this.selectedEvent.categoryId = id;
        this.isSubcategoriesOpen = false;
      }
    })

  }

  showSubcategories() {
    this.loadSubcategories(this.selectedEvent.categoryId);
  }

  loadFormat(id: number) {
    this.categoryService.findFormat(id).subscribe((data: any) => {
      this.format = data;
    })
  }

  loadFormats() {
    this.categoryService.findAllFormats().subscribe((data: any) => {
      this.formats = data;
    })
  }

  loadCountries() {
    this.locationService.getAllCountries().subscribe((data: any) => {
      this.countries = data;
    })
  }

  loadCities() {
    this.locationService.getAllCities().subscribe((data: any) => {
      this.cities = data;
    })
  }

  showCitiesByCountry() {
    this.locationService.getCitiesByCountry(this.countryId).subscribe((data: any) => {
      this.cities = data;
    },
      (error) => {
        console.log("Error: " + error);
        this.errorMessage = "Error: cities not found";
      }
    )
  }

  showCountryByCity() {
    if (this.cityId == 0) {
      return;
    }
    this.locationService.getCityById(this.cityId).subscribe((data: City) => {
      this.countryId = data.countryId;
    },
      (error) => {
        this.errorMessage = "Error: country not found";
      }
    )
  }

  clearInput() {
    this.canCheck = true;
    this.event = {
      id: this.auxId,
      title: '',
      description: '',
      startDate: new Date(0),
      endDate: new Date(0),
      locationId: 0,
      organizerId: this.authService.getCurrentUser()?.id,
      categoryId: this.selectedEvent.categoryId || 1,
      formatId: 1,
      maxGuestAmount: 100,
      ageLimit: 21,
      isPublic: false,
      secretCode: '',
    };
    this.startDate = new Date(0).toISOString().slice(0, 16);
    this.selectedEvent = this.event;
  }

  editEvent(eventId: number) {
    this.eventService.updateEvent(eventId, {
      title: this.selectedEvent.title,
      description: this.selectedEvent.description,
      startDate: new Date(this.selectedEvent.startDate),
      endDate: new Date(this.selectedEvent.endDate),
      locationId: this.selectedEvent.locationId,
      organizerId: this.selectedEvent.organizerId,
      categoryId: this.selectedEvent.categoryId,
      formatId: this.selectedEvent.formatId,
      maxGuestAmount: this.selectedEvent.maxGuestAmount,
      ageLimit: this.selectedEvent.ageLimit,
      isPublic: this.selectedEvent.isPublic,
      secretCode: this.selectedEvent.secretCode,
    }).subscribe(
      (response: any) => {
        this.isErrorMessage = false;
        this.successMessage = "Event successfully updated!";
        this.isSuccessMessage = true;
        this.ngOnInit();
      },
      (error) => {
        if (this.selectedEvent.title.length > 20) {
          this.isErrorMessage = true;
          this.errorMessage = "Title is too long";
          return;
        } if (this.selectedEvent.startDate < new Date(moment.now())) {
          this.isErrorMessage = true;
          this.errorMessage = "Date is too early";
          return;
        }
        else {
          this.errorMessage = "Error: something went wrong while updating the event";
          this.isErrorMessage = true;
        }
      }
    );
  }

  changeAccessMode() {
    if (this.accessLevel === 'Public') {
      this.selectedEvent.isPublic = true;
      this.selectedEvent.secretCode = 'NO_SECRET_CODE';
      this.event.isPublic = true;
    } else if (this.accessLevel === 'Private') {
      this.selectedEvent.isPublic = false;
      this.event.isPublic = false;
    }
  }

  createEvent() {
    if (this.event.startDate < new Date(moment.now())) {
      this.errorMessage = "Date is too early";
      this.isErrorMessage = true;
      return;
    }
    if (!this.event.isPublic && this.event.secretCode == null) {
      this.errorMessage = "Secret code is empty";
      this.isErrorMessage = true;
      return;
    }

    console.log(this.event.secretCode);


    this.createLocation();
    this.eventService.createEvent({
      title: this.event.title,
      description: this.event.description,
      startDate: new Date(this.event.startDate),
      endDate: new Date(this.event.endDate),
      locationId: this.locations[this.locations.length - 1].id + 1,
      organizerId: this.event.organizerId,
      categoryId: this.event.categoryId,
      formatId: this.event.formatId,
      maxGuestAmount: this.event.maxGuestAmount,
      ageLimit: this.event.ageLimit,
      isPublic: this.event.isPublic,
      secretCode: this.event.secretCode || 'NO_SECRET',
    }).subscribe(
      (response: any) => {
        this.notificationService.createNotification({
          userId: +this.authService.getCurrentUser()?.id,
          eventId: response.id,
          message: 'Event created!',
          isRead: false,
        }).subscribe();
        this.successMessage = "Event successfully created!";
        this.isSuccessMessage = true;
        this.isErrorMessage = false;
        this.ngOnInit();
      },
      (error) => {
        if (this.selectedEvent.title.length >= 20) {
          this.isErrorMessage = true;
          this.isSuccessMessage = false;
          this.errorMessage = "Title is too long";
          return;
        }
        else {
          this.errorMessage = "Error: something went wrong while creating the event";
          this.isErrorMessage = true;
          this.isSuccessMessage = false;
          console.log("Error: " + error.message);
        }
      }
    );
  }

  preDelete() {
    if (confirm("Are you sure you want to delete this event?")) {
      this.deleteEvent(this.selectedEvent.id);
    }
  }

  deleteEvent(eventId: number) {
    this.eventService.removeEvent(eventId).subscribe(
      (response: any) => {
        this.successMessage = "Event successfully deleted!";
        this.isSuccessMessage = true;
        this.isErrorMessage = false;
        this.ngOnInit();
      },
      (error) => {
        this.errorMessage = "Error: something went wrong while deleting the event";
        this.isErrorMessage = true;
        this.isSuccessMessage = false;
      }
    );
  }

  createLocation() {
    if (this.cityId == undefined) {
      this.cityId = this.cities[0].id;
    }
    this.locationService.createLocation(
      +this.cityId,
      this.address,
      +this.cityId
    ).subscribe(
      (response: any) => {
        this.isErrorMessage = false;
        console.log("Location successfully created");
      },
      (error) => {
        this.errorMessage = "Error: something went wrong while creating the location";
        this.isErrorMessage = true;
        this.isSuccessMessage = false;
        console.log("Error: " + error.message);
      }
    );
  }

  updateIsPublic() {
    if (this.selectedEvent.isPublic) {
      this.selectedEvent.isPublic = true;
    }
  }

  closeMessage() {
    this.isErrorMessage = false;
    this.isSuccessMessage = false;
  }
}

