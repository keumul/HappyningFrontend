import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';

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

  countryId!: number;
  countries!: Country[];
  cityId!: number;
  cities!: City[];
  address!: string;
  country: Country = { id: 0, countryName: 'Country' };
  city: City = { id: 0, cityName: 'City', countryId: 0 };
  locations!: { id: number, details: string, cityId: number }[];

  isPrivate = true;
  isPublic = true;
  isOpenStatistic = true;

  message!: string;
  errorMessage!: string;
  successMessage!: string;
  isErrorMessage = false;
  isSuccessMessage = false;

  selectedImage: File | undefined;
  base64Image: string | undefined;
  image: string | undefined;
  isFileSelected: boolean = false;
  bytes: any | undefined;

  isImageEditorOpen = false;
  isOverlayVisible = false;
  isSelectedEvent = false;

  isUser: boolean = false;

  constructor(private eventService: EventService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private notificationService: NotificationService,
    private locationService: LocationService,
    private _snackBar: MatSnackBar,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.canCheck = true;
    let userId = this.authService.getCurrentUser()?.id;
    if (userId == undefined) {
      this.isUser = false;
    } else {
      this.isUser = true;
    }
    this.ageLimitCheck(userId!);

    this.loadCategories();
    this.loadFormats();
    this.loadCountries();
    this.loadCities();
    this.loadLocations();
    this.eventService.getUserEvents(userId).subscribe(data => {
      this.events = data;
      this.onSelectEvent({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        locationId: this.locations[0].id,
        organizerId: this.authService.getCurrentUser()?.id,
        categoryId: this.categories[0].id,
        formatId: this.formats[0].id,
        ageLimit: 21,
        maxGuestAmount: 100,
        isPublic: true,
      });
      this.isSelectedEvent = false;
      this.image = "";
      this.isImageEditorOpen = false;
      this.clearInput();
      this.showCitiesByCountry();
    });

    if (this.selectedEvent.isPublic) {
      this.accessLevel = 'Public';
    } else {
      this.accessLevel = 'Private';
    }
  }

  ageLimitCheck(userId: number) {
    var today = new Date();
    this.userService.findUser(userId).subscribe((data: any) => {
      var birthdate = new Date(data.bday);
      var age = today.getFullYear() - birthdate.getFullYear();
      var monthDiff = today.getMonth() - birthdate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
      }
      if (age < 18) {
        this.openOverlay();
      }
    });
  }

  openOverlay() {
    this.isOverlayVisible = true;
  }

  closeOverlay() {
    this.isOverlayVisible = false;
    this.router.navigate(['/home']);
  }

  openEventsList() {
    this.isEventsListOpen = !this.isEventsListOpen;
  }

  onSelectEvent(event: any) {
    this.image = "";
    this.canCheck = false;
    this.isImageEditorOpen = true;

    this.selectedEvent = event;
    this.isSelectedEvent = true;

    this.loadCategory(this.selectedEvent.categoryId);
    this.loadFormat(this.selectedEvent.formatId);
    this.loadLocation(this.selectedEvent.locationId);
    this.loadCategories();
    this.loadCountries();
    this.loadCities();
    this.loadFormats();
    this.loadCountries();
    this.loadCities();
    this.showPhoto();
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

  loadCity(id: number) {
    this.locationService.getCityById(id).subscribe((data: any) => {
      this.city = data;
      this.locationService.getCountryById(data.countryId).subscribe((data: any) => {
        this.country = data;
      })
    })
  }

  loadLocation(id: number) {
    this.locationService.getLocationById(id).subscribe((data: any) => {
      this.address = data.details;
      this.loadCity(data.cityId);
    })
  }

  loadCategories() {
    this.categories = [];
    this.categoryService.findAllCategories().subscribe((data: any) => {
      this.categories = data;
    });
  }

  loadLocations() {
    this.locationService.getAllLocations().subscribe((data: any) => {
      this.locations = data;
    })
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
    if (this.countryId == undefined) {
      this.countryId = this.countries[0].id;
    }
    this.locationService.getCitiesByCountry(this.countryId).subscribe((data: any) => {
      this.cities = data;
      this.cityId = data[0].id;
    },
      (error) => {
        this.errorMessage = "Error: cities not found";
      }
    )
  }

  showCountryByCity() {
    if (this.cityId == undefined) {
      this.cityId = this.cities[0].id;
    } else if (this.cityId == 0) {
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
      startDate: new Date(),
      endDate: new Date(),
      locationId: 0,
      organizerId: this.authService.getCurrentUser()?.id,
      categoryId: this.categories[0].id,
      formatId: 1,
      maxGuestAmount: 100,
      ageLimit: 21,
      isPublic: true,
      secretCode: '',
      photo: 0,
    };
    this.startDate = new Date(0).toISOString().slice(0, 16);
    this.selectedEvent = this.event;
  }

  editEvent(eventId: number) {
    if (this.selectedEvent.title == '' || this.selectedEvent.description == '' || this.selectedEvent.startDate == null || this.selectedEvent.endDate == null || this.selectedEvent.locationId == 0 || this.selectedEvent.categoryId == 0 || this.selectedEvent.formatId == 0 || this.selectedEvent.maxGuestAmount == 0 || this.selectedEvent.ageLimit == 0) {
      this.isErrorMessage = true;
      this.errorMessage = "Event not selected";
      return;
    } if (new Date(this.selectedEvent.startDate) < new Date(moment.now())) {
      this.isErrorMessage = true;
      this.errorMessage = "Date is too early";
      return;
    } if (new Date(this.selectedEvent.startDate) > new Date(this.selectedEvent.endDate)) {
      this.isErrorMessage = true;
      this.errorMessage = "End date is before start date";
      return;
    }
    this.updateLocation(this.selectedEvent.locationId);
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
      photo: this.selectedEvent.photo,
    }).subscribe(
      (response: any) => {
        this.isErrorMessage = false;
        this.successMessage = "Event successfully updated!";
        this.isSuccessMessage = true;
        this.ngOnInit();
      },
      (error) => {
        if (this.selectedEvent.title.length > 50) {
          this.isErrorMessage = true;
          this.errorMessage = "Title is too long";
          return;
        } else {
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
    this.event = this.selectedEvent;
    const startDate = new Date(this.event.startDate);
    const endDate = new Date(this.event.endDate);
    if (this.event.title == '' || this.event.description == '' || this.event.startDate == null || this.event.endDate == null || this.event.locationId == 0 || this.event.categoryId == 0 || this.event.formatId == 0 || this.event.maxGuestAmount == 0 || this.event.ageLimit == 0) {
      this.errorMessage = "Fill in the empty fields";
      this.isErrorMessage = true;
      return;
    }
    if (this.selectedEvent.title.length >= 50) {
      this.isErrorMessage = true;
      this.isSuccessMessage = false;
      this.errorMessage = "Title is too long";
      return;
    }

    if (startDate < new Date()) {
      this.errorMessage = "Date is too early";
      this.isErrorMessage = true;
      return;
    }
    if (startDate > endDate) {
      this.isErrorMessage = true;
      this.errorMessage = "End date is before start date";
      return;
    }
    if (!this.event.isPublic && this.event.secretCode == null) {
      this.errorMessage = "Secret code is empty";
      this.isErrorMessage = true;
      return;
    }

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
      photo: this.event.photo || 0,
    }).subscribe(
      (response: any) => {
        this.notificationService.createNotification(response.id,
          +this.authService.getCurrentUser()?.id, {
          message: 'Event created!',
          isRead: false,
        }).subscribe();
        this.successMessage = "Event successfully created!";
        this.isSuccessMessage = true;
        this.isErrorMessage = false;
        this.ngOnInit();
        this._snackBar.open('You can add a cover to the event in the editor!', '', { duration: 5000 });
      },
      (error) => {
        this.errorMessage = "Error: something went wrong while creating the event";
        this.isErrorMessage = true;
        this.isSuccessMessage = false;
        return;
      }
    );
  }

  preDelete() {
    if (confirm("Are you sure you want to delete this event?")) {
      this.deleteEvent(this.selectedEvent.id);
    }
  }

  deleteEvent(eventId: number) {
    if (this.selectedEvent.title == '' || this.selectedEvent.description == '' || this.selectedEvent.startDate == null || this.selectedEvent.endDate == null || this.selectedEvent.locationId == 0 || this.selectedEvent.categoryId == 0 || this.selectedEvent.formatId == 0 || this.selectedEvent.maxGuestAmount == 0 || this.selectedEvent.ageLimit == 0) {
      this.isErrorMessage = true;
      this.errorMessage = "Event not selected";
      return;
    }
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
    this.locationService.createLocation(+this.cityId, this.address, +this.cityId).subscribe(
      (response: any) => {
        this.isErrorMessage = false;
      },
      (error) => {
        this.errorMessage = "Error: something went wrong while creating the location";
        this.isErrorMessage = true;
        this.isSuccessMessage = false;
      }
    );
  }

  updateLocation(id: number) {
    this.locationService.updateLocation(id, {
      details: this.address,
      cityId: +this.cityId,
    }).subscribe(
      (response: any) => {
        this.loadLocation(response.id);
        this.isErrorMessage = false;
      },
      (error) => {
        this.errorMessage = "Error: something went wrong while updating the location";
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

  onFileSelected(event: any) {
    this.selectedImage = event.target.files[0];
    this.encodeImage();
    this.isFileSelected = true;
  }

  cancelUploadPhoto() {
    this.isFileSelected = false;
    this.selectedImage = undefined;
    this.base64Image = undefined;
  }

  encodeImage() {
    const reader = new FileReader();
    reader.onload = () => {
      this.base64Image = reader.result as string;
    };
    reader.readAsDataURL(this.selectedImage as File);
  }

  uploadImage(id: number) {
    this.bytes = btoa(this.base64Image!);
    this.eventService.uploadImage(id, { photo: this.bytes }).subscribe((data: any) => {
      this.selectedEvent.photo = data.id;
    });
  }

  showPhoto() {
    let id = this.selectedEvent.id;
    this.eventService.showImage(id).subscribe((data) => {
      this.image = data;
    });
  }

  openStatistic() {
    this.isOpenStatistic = !this.isOpenStatistic;
    this.isEventsListOpen = false;
  }
}

