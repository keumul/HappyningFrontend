import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { EventService } from '../services/event.service';
import { Event } from '../dto/event.dto';
import { LocationService } from '../services/location.service';
import { CategoryService } from '../services/category.service';
import { Location } from '../dto/location.dto';
import { Category } from '../dto/category.dto';
import { Format } from '../dto/format.dto';
import { Country } from '../dto/country.dto';
import { City } from '../dto/city.dto';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  errorMessage?: string
  username!: string;
  password!: string;
  user!: any;
  filter: any;
  events: Event[] = [];
  categories: any;
  formats: any;
  allEvents: Event[] = [];
  originalEvents: Event[] = [];
  filteredEvents: Event[] = [];
  showFilteredResult: boolean = false;
  startDateFilter: Date | null = null;
  locationFilter: string | null = null;
  categoryFilter: string | null = null;
  formatFilter: string | null = null;
  isFilter = false;
  category!: Category;

  event!: Event;
  subcategories: Category[] = [];
  format!: Format;
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

  constructor(private authService: AuthService,
    private eventService: EventService,
    private locationService: LocationService,
    private categoryService: CategoryService
  ) { }

  isUser: boolean = false;

  ngOnInit(): void {
    this.errorMessage = ''
    this.checkCredentials();
    this.loadEvents();
    this.loadCategories();
    this.loadLocations();
    this.loadFormats();
    this.loadAllEvents();
    this.loadCategories();
    this.clearFilters();

    this.showFilteredResult = false;
  }

  loadEvents() {
    this.eventService.getAllEvents().subscribe(
      (data: Event[]) => {
        this.events = data;
      },
      (error) => {
        console.error('Error loading events', error);
      }
    );
  }


  checkCredentials() {
    try {
      if (this.authService.getCurrentUser()) {
        this.isUser = true;
      } else {
        this.isUser = false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  loadAllEvents() {
    this.eventService.getAllEvents().subscribe((data: Event[]) => {
      this.allEvents = data;
      this.originalEvents = data.slice();
      this.applyFilters();
    })
  }

  applyFilters() {
    this.showFilteredResult = true;
    this.filteredEvents = this.allEvents.filter(event => this.passesFilter(event));
  }

  passesFilter(event: any): boolean {
    const eventStartDate = new Date(event.startDate);
    const filterStartDate = this.startDateFilter?.toISOString();
    
    console.log('Filtering:', event);
    console.log('StartDate Filter:', this.startDateFilter);
    console.log('Location Filter:', this.locationFilter);
    console.log('Category Filter:', this.categoryFilter);
    console.log('Format Filter:', this.formatFilter);

    const passes = 
      (!filterStartDate || eventStartDate >= new Date(filterStartDate)) &&
      (!this.locationFilter || event.location.includes(this.locationFilter)) &&
      (!this.categoryFilter || event.categoryId === this.categoryFilter) &&
      (!this.formatFilter || event.formatId === this.formatFilter);
  
    console.log('Passes Filter:', passes);
    return passes;
  }

  clearFilters() {
    this.startDateFilter = null;
    this.locationFilter = null;
    this.categoryFilter = null;
    this.formatFilter = null;
    this.allEvents = this.originalEvents.slice();
    this.applyFilters();
    this.filteredEvents = [];
    this.showFilteredResult = false;
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
}
