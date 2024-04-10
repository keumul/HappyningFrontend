import { Component, OnInit } from '@angular/core';
import { Event } from '../dto/event.dto';
import { Location } from '../dto/location.dto';
import { City } from '../dto/city.dto';
import { Country } from '../dto/country.dto';
import { EventService } from '../services/event.service';
import { LocationService } from '../services/location.service';
import { Category } from '../dto/category.dto';
import { Format } from '../dto/format.dto';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
})
export class EventListComponent implements OnInit {
  events!: Event[];
  locations!: Location;
  city!: City;
  country!: Country;
  locationDetails: { cityName: string, countryName: string }[] = [];
  selectedDate!: Date;
  isFilter = false;
  cityText: string = "";

  countryId!: number;
  countries!: Country[];
  cityId!: number;
  cities!: City[];
  address!: string;

  category!: Category;
  categories: Category[] = [];
  subcategories: Category[] = [];
  isSubcategoriesOpen = false;
  formatId!: number;
  categoryId!: number;
  subcategoryId!: number;
  format!: Format;
  formats!: Format[];

  startDateFilter!: Date;
  endDateFilter!: Date;

  constructor(
    private eventService: EventService,
    private locationService: LocationService,
    private categoryService: CategoryService
  ) { }

  async ngOnInit() {
    this.loadAllEvents();
    this.loadLocations();
    this.loadCountries();
    this.loadCities();
    this.loadCategories();
    this.loadFormats();
  }

  async loadLocations() {
    this.locationService.getAllLocations().subscribe((data: any) => {
      this.locations = data;
    })
  }

  async loadCountries() {
    this.locationService.getAllCountries().subscribe((data: any) => {
      this.countries = data;
    })
  }

  async loadCities() {
    this.locationService.getAllCities().subscribe((data: any) => {
      this.cities = data;
    })
  }

  showCitiesByCountry() {
    this.locationService.getCitiesByCountry(this.countryId).subscribe((data: City[]) => {
      this.cities = data;
      this.cityId = 0;
      this.cityText = "The city is not selected, so all the cities of the current country will be shown"
      if (this.cities.length == 1) {
        this.cityText = "There is only one city in this country, and it will be automatically selected"
      }
    },
      (error) => {
        console.log("Error: " + error);
      }
    )
  }

  showCountryByCity() {
    if (this.cityId == 0) {
      return;
    }
    this.locationService.getCityById(this.cityId).subscribe((data: City) => {
      this.countryId = data.countryId;
      this.cityText = " "
    },
      (error) => {
        console.log("Error: " + error);
      }
    )
  }

  async locationFilter() {
    let filteredEvents = [];
    if (this.cityId || this.countryId) {
      try {
        const data = await this.eventService.getAllEvents().toPromise();
        for (let i = 0; i < data!.length; i++) {
          const location = await this.locationService.getLocationById(data![i].locationId).toPromise();
          const city = await this.locationService.getCityById(location.cityId).toPromise();
          if (city.countryId === +this.countryId && (city.id === +this.cityId || this.cityId === 0)) {
            filteredEvents.push(data![i]);
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    } else if (!this.cityId && !this.countryId) {
      return this.events;
    }
    this.events = filteredEvents;
    this.locationDetails = await this.loadAllLocationDetails();
    return filteredEvents;
  }


  async dateFilter() {
    let filteredEvents = [];
  
    const data = await this.eventService.getAllEvents().toPromise();
  
    for (let i = 0; i < data!.length; i++) {
      const eventStartDate = new Date(data![i].startDate);
      const eventEndDate = new Date(data![i].endDate);
      
      const startFilterDate = new Date(this.startDateFilter);
      const endFilterDate = new Date(this.endDateFilter);
  
      eventStartDate.setHours(0, 0, 0, 0);
      eventEndDate.setHours(0, 0, 0, 0);
      startFilterDate.setHours(0, 0, 0, 0);
      endFilterDate.setHours(0, 0, 0, 0);
  
      if (
        (this.startDateFilter && !this.endDateFilter && eventStartDate.getTime() === startFilterDate.getTime()) ||
        (!this.startDateFilter && this.endDateFilter && eventEndDate.getTime() === endFilterDate.getTime()) ||
        (this.startDateFilter && this.endDateFilter && eventStartDate >= startFilterDate && eventEndDate <= endFilterDate)
      ) {
        filteredEvents.push(data![i]);
      } else if (!this.startDateFilter && !this.endDateFilter) {
        return this.events;
      }
    }
  
    this.events = filteredEvents;
    return filteredEvents;
  }

  async applyFilters() {
    await this.loadAllEvents();
    const locationFilteredEvents = await this.locationFilter();
    const dateFilteredEvents = await this.dateFilter();
    const combinedFilteredEvents = locationFilteredEvents.filter(event =>
      dateFilteredEvents!.some(filteredEvent => filteredEvent.id === event.id)
    );
    console.log('Location filtered events:', locationFilteredEvents);
    console.log('Date filtered events:', dateFilteredEvents);

    console.log('Filtered events:', combinedFilteredEvents);

    this.events = combinedFilteredEvents;
    return combinedFilteredEvents;
  }

  async openFilter() {
    this.isFilter = !this.isFilter;
  }

  async loadAllEvents() {
    try {
      const data = await this.eventService.getAllEvents().toPromise();
      const today = new Date();
      if (data !== undefined ) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].endDate < today) {
            data.splice(i, 1);
          }
        }
        this.events = data as Event[];
        this.locationDetails = await this.loadAllLocationDetails();
      } else {
        console.error('No data received from getAllEvents()');
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  redirectToEvent(eventId: number) {
    window.location.href = `/event/${eventId}`;
  }

  async loadLocationDetails(id: number) {
    try {
      const location = await this.locationService.getLocationById(id).toPromise() as Location;
      const city = await this.locationService.getCityById(location.cityId).toPromise() as City;
      const country = await this.locationService.getCountryById(city.countryId).toPromise() as Country;
      return {
        cityName: city.cityName,
        countryName: country.countryName
      };
    } catch (error) {
      console.error('Error loading location details:', error);
      return null;
    }
  }

  async loadAllLocationDetails() {
    try {
      this.locationDetails = [];
      for (const event of this.events) {
        const details = await this.loadLocationDetails(event.locationId);
        if (details !== null) {
          this.locationDetails.push(details);
        }
      }
      return this.locationDetails;
    } catch (error) {
      console.error('Error loading location details:', error);
      return [];
    }
  }

  async loadCategory(id: number) {
    this.categoryService.findCategory(id).subscribe((data: any) => {
      this.category = data;
    })
  }

  async loadCategories() {
    this.categories = [];
    this.categoryService.findAllCategories().subscribe((data: any) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].parentId == null) {
          this.categories.push(data[i]);
        }
      }
    });
    console.log(this.categories);

  }

  async loadSubcategories(id: number) {
    this.categoryService.findSubcategories(id).subscribe((data: any) => {
      if (data.length > 0) {
        this.subcategories = data;
        this.isSubcategoriesOpen = true;
      } else {
        this.categoryId = id;
        this.isSubcategoriesOpen = false;
      }
    })
    console.log(this.subcategories);
  }

  async showSubcategories() {
    this.loadSubcategories(this.category.id);
  }

  async loadFormat(id: number) {
    this.categoryService.findFormat(id).subscribe((data: any) => {
      this.format = data;
    })
  }

  async loadFormats() {
    this.categoryService.findAllFormats().subscribe((data: any) => {
      this.formats = data;
    })
  }

  async sortEvents() {
    const data = await this.eventService.getAllEvents().toPromise();
  
    data!.sort((a, b) => {
      const dateA = new Date(a.creationDate).getTime();
      const dateB = new Date(b.creationDate).getTime();
      return dateA - dateB;
    });

    this.events = data!;
  }
}
