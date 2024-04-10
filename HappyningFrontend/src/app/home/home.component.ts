import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { EventService } from '../services/event.service';
import { Event } from '../dto/event.dto';

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
  events: Event[] = [];
  allEvents: Event[] = [];
  event!: Event;
  auxDate!: Date;
  startDate!: string;
  endDate!: string;
  newDate!: Date;
  selectedEvent!: Event;
  accessLevel: string = 'Public';
  canCheck = true;
  isPrivate = true;
  isPublic = true;

  constructor(private authService: AuthService,
    private eventService: EventService
  ) { }

  isUser: boolean = false;

  ngOnInit(): void {
    this.errorMessage = ''
    this.checkCredentials();
    this.loadEvents();
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

}
