import { Component, OnInit } from '@angular/core';
import { Event } from '../dto/event.dto';
import { Location } from '../dto/location.dto';
import { City } from '../dto/city.dto';
import { Country } from '../dto/country.dto';
import { EventService } from '../services/event.service';
import { LocationService } from '../services/location.service';

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

  constructor(
    private eventService: EventService,
    private locationService: LocationService
  ) { }

  async ngOnInit() {
    this.loadAllEvents();
  }

  async loadAllEvents() {
    try {
      const data = await this.eventService.getAllEvents().toPromise();
      if (data !== undefined) {
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
  
}
