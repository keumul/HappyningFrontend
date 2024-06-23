import { Component, OnInit } from '@angular/core';
import { CalendarDay } from './calendar';
import { Event } from '../dto/event.dto'
import { EventService } from '../services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit{

  constructor(private eventService: EventService,
    private router: Router) { }

  public calendar: CalendarDay[] = [];
  monthNames: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  public displayMonth!: string;
  private monthIndex: number = 0;
  currentDay: any = new Date().getDate();
  currentMonth: any = new Date().getMonth();
  events!: Event[];
  currentYear: number = new Date().getFullYear();

  ngOnInit() {
    this.getEvents();
    this.generateCalendarDays(this.monthIndex);
  }
  
  private generateCalendarDays(monthIndex: number): void {
    this.calendar = [];
    let day: Date = new Date(new Date().setMonth(new Date().getMonth() + monthIndex));
    this.displayMonth = this.monthNames[day.getMonth()];
    let startingDateOfCalendar = this.getStartDateForCalendar(day);
    let dateToAdd = startingDateOfCalendar;

    for (var i = 0; i < 42; i++) {
      this.calendar.push(new CalendarDay(new Date(dateToAdd)));
      dateToAdd = new Date(dateToAdd.setDate(dateToAdd.getDate() + 1));
    }
  }

  private getStartDateForCalendar(selectedDate: Date){
    let lastDayOfPreviousMonth = new Date(selectedDate.setDate(0));
    let startingDateOfCalendar: Date = lastDayOfPreviousMonth;
    
    if (startingDateOfCalendar.getDay() != 1) {
      do {
        startingDateOfCalendar = new Date(startingDateOfCalendar.setDate(startingDateOfCalendar.getDate() - 1));
      } while (startingDateOfCalendar.getDay() != 1);
    }

    return startingDateOfCalendar;
  }
  public increaseMonth() {
    this.monthIndex++;
    this.generateCalendarDays(this.monthIndex);
  }

  public decreaseMonth() {
    this.monthIndex--
    this.generateCalendarDays(this.monthIndex);
  }

  public setCurrentMonth() {
    this.monthIndex = 0;
    this.generateCalendarDays(this.monthIndex);
  }

  isEventInCell(event: any, cellDate: Date): boolean {
    const eventStartDate = new Date(event.startDate);
    console.log(eventStartDate.getDate() === cellDate.getDate() &&
    eventStartDate.getMonth() === cellDate.getMonth() &&
    eventStartDate.getFullYear() === cellDate.getFullYear());
    
    return eventStartDate.getDate() === cellDate.getDate() &&
           eventStartDate.getMonth() === cellDate.getMonth() &&
           eventStartDate.getFullYear() === cellDate.getFullYear();
  }
  
  getEvents() {
    return this.eventService.getAllEvents().subscribe(data => {
      this.events = data;
    });
  }

  redirectToEvent(eventId: number) {
    this.router.navigate([`event/${eventId}`]);
  }
}
