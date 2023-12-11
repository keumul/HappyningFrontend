import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { Router } from '@angular/router';
import { Event } from '../dto/event.dto';
import { AuthService } from '../services/auth.service';
import { ParticipantService } from '../services/participant.service';
import { Participant } from '../dto/participant.dto';
import { CategoryService } from '../services/category.service';
import { Category } from '../dto/category.dto';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
})
export class EventComponent implements OnInit {
  events: Participant[] = [];
  myevents: Event[] = [];
  originalEvents: Event[] = [];
  filteredEvents: Event[] = [];
  allEvents: Event[] = [];
  categories: Category[] = [];
  category!: Category;
  selectedEvent!: Event;
  eventRates: any[] = [];
  currentUser: any;
  eventsDetails?: { [eventId: number]: { title: string, startDate: Date } } = {};
  userId: number = 0;
  startDateFilter: Date | null = null;
  locationFilter: string | null = null;
  categoryFilter: string | null = null;
  isFilter = false;
  showFilteredResult: boolean = false;
  constructor(
    private eventService: EventService,
    private router: Router,
    private authService: AuthService,
    private participant: ParticipantService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()?.id;
    this.loadMyEvents();
    this.loadEvents();
    this.loadAllEvents();
    this.loadCategories();
    this.clearFilters();

    this.showFilteredResult = false;
  }
  
  filterOn() {
      this.isFilter = !this.isFilter;
      this.clearFilters();
  }

  loadCategories() {
    this.categoryService.findAllCategories().subscribe((data: any) => {
      this.categories = data;
    })
  }

  loadAllEvents() {
    this.eventService.getAllEvents().subscribe((data: Event[]) => {
      this.allEvents = data;
      this.originalEvents = data.slice();
      this.applyFilters();
    })
  }

  loadMyEvents() {
    this.eventService.getUserEvents(this.userId).subscribe((data: Event[]) => {
      this.myevents = data;
    })
  }

  loadEvents() {
    this.participant.findUserEvents(this.userId).subscribe((data: Participant[]) => {
      this.events = data;
      console.log(this.events);
    })
  }

  onSelectEvent(event: Event) {
    this.selectedEvent = event;
    this.loadEventRates(event.id);
  }

  loadEventRates(eventId: number) {
    this.eventService.viewEventRate(eventId).subscribe((rates) => {
      this.eventRates = rates;
    });
  }

  rateEvent(rateData: any) {
    this.eventService.rateEvent(this.selectedEvent.id, rateData).subscribe(() => {
      this.loadEventRates(this.selectedEvent.id);
    });
  }

  removeEventRate(rateId: number) {
    this.eventService.removeEventRate(rateId).subscribe(() => {
      this.loadEventRates(this.selectedEvent.id);
    });
  }

  redirectToEvent(eventId: number) {
    this.router.navigate([`event/${eventId}`]);
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
  
    const passes = 
      (!filterStartDate || eventStartDate >= new Date(filterStartDate)) &&
      (!this.locationFilter || event.location.includes(this.locationFilter)) &&
      (!this.categoryFilter || event.categoryId === this.categoryFilter);
  
    console.log('Passes Filter:', passes);
    return passes;
  }

  loadCategory(id: number) {
    this.categoryService.findCategory(id).subscribe((data: any) => {
      this.category = data;
    })
  }

  clearFilters() {
    this.startDateFilter = null;
    this.locationFilter = null;
    this.categoryFilter = null;
    this.allEvents = this.originalEvents.slice();
    this.applyFilters();
    this.filteredEvents = [];
    this.showFilteredResult = false;
  }
}
