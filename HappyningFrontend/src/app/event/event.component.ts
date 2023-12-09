import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { Router } from '@angular/router';
import { Event } from '../dto/event.dto';
import { AuthService } from '../services/auth.service';
import { ParticipantService } from '../services/participant.service';
import { Participant } from '../dto/participant.dto';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
})
export class EventComponent implements OnInit {
  events: Participant[] = [];
  myevents: Event[] = [];
  allEvents: Event[] = [];
  selectedEvent!: Event;
  eventRates: any[] = [];
  currentUser: any;
  eventsDetails?: { [eventId: number]: { title: string, startDate: Date } } = {};
  userId: number = 0;
  startDateFilter: Date | null = null;
  locationFilter: string | null = null;
  categoryFilter: string | null = null;

  constructor(
    private eventService: EventService,
    private router: Router,
    private authService: AuthService,
    private participant: ParticipantService
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()?.id;
    this.loadMyEvents();
    this.loadEvents();
    this.loadAllEvents();
  }

  loadAllEvents() {
    this.eventService.getAllEvents().subscribe((data: Event[]) => {
      this.allEvents = data;
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
    this.allEvents = this.allEvents.filter(event => this.passesFilter(event));
  }
  
  passesFilter(event: any): boolean {
    return (!this.startDateFilter || event.event.startDate >= this.startDateFilter)
      && (!this.locationFilter || event.event.location.includes(this.locationFilter))
      && (!this.categoryFilter || event.event.category === this.categoryFilter);
  }
}
