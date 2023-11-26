// event.component.ts
import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { Router } from '@angular/router';
import { Event } from '../dto/event.dto';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';
@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
})
export class EventComponent implements OnInit {
  events: Event[] = [];
  selectedEvent!: Event;
  eventRates: any[] = [];
  currentUser: any;
  startDate!: string;
  auxDate!: Date;

  constructor(
    private eventService: EventService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    let userId = this.authService.getCurrentUser()?.id;
    this.eventService.getAllEventsByUser(userId).subscribe((data: Event[]) => {
      this.events = data;
      this.auxDate = new Date(this.events[0].startDate);
      this.startDate = moment().format('YYYY.MM.DD HH:MM');
    })
  }

  onSelectEvent(event: any) {
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
}
