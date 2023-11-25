import { Component, OnInit, PipeTransform } from '@angular/core';
import { EventService } from '../services/event.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Event } from '../dto/event.dto';
import { CategoryService } from '../services/category.service';
import { Category } from '../dto/category.dto';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  auxId!: number;
  event!: Event;
  events!: any[];
  selectedEvent!: Event;
  category!: Category;
  categories!: Category[];
  auxDate!: Date;
  startDate!: string;
  newDate!: Date;
  message!: string;

  constructor(private eventService: EventService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    let userId = this.authService.getCurrentUser()?.id;
    this.eventService.getUserEvents(userId).subscribe(data => {
      this.events = data;
    });
    this.auxId = this.events.length + Math.random() * 10000;
    this.loadCategories();
    this.clearInput();
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 2000,
      panelClass: ['blue-snackbar']
    })
  }

  onSelectEvent(event: any) {
    this.selectedEvent = event;
    this.auxDate = new Date(this.selectedEvent.startDate);
    this.startDate = moment().format('YYYY.MM.DD HH:MM');
    this.loadCategory(this.selectedEvent.categoryId);
    this.loadCategories();
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
      this.categories = data;
    })
  }

  clearInput() {
    this.event = {
      id: this.auxId,
      title: '',
      description: '',
      startDate: new Date(0),
      location: '',
      organizerId: this.authService.getCurrentUser()?.id,
      categoryId: this.selectedEvent.categoryId,
      maxGuestAmount: 100,
      isPublic: false,
    };
    this.startDate = new Date(0).toISOString().slice(0, 16);
    this.selectedEvent = this.event;
  }

  editEvent(eventId: number) {
    this.eventService.updateEvent(eventId, {
      title: this.selectedEvent.title,
      description: this.selectedEvent.description,
      startDate: new Date(this.selectedEvent.startDate),
      location: this.selectedEvent.location,
      organizerId: this.selectedEvent.organizerId,
      categoryId: this.selectedEvent.categoryId,
      maxGuestAmount: this.selectedEvent.maxGuestAmount,
      isPublic: this.selectedEvent.isPublic,
    }).subscribe(
      (response: any) => {
        this.openSnackBar('Событие успешно изменено');
        this.ngOnInit();
      },
      (error) => {
        if (this.selectedEvent.title.length > 20) {
          this.openSnackBar('Заголовок недопустимой длины (максимум 20 символов)');
          return;
        } else {
          this.openSnackBar(error.error.message);
        }
      }
    );
  }

  createEvent() {
    this.eventService.createEvent({
      title: this.event.title,
      description: this.event.description,
      startDate: new Date(this.event.startDate),
      location: this.event.location,
      organizerId: this.event.organizerId,
      categoryId: this.event.categoryId,
      maxGuestAmount: this.event.maxGuestAmount,
      isPublic: this.event.isPublic,
    }).subscribe(
      (response: any) => {
        this.openSnackBar('Событие успешно создано');
        this.ngOnInit();
      },
      (error) => {
        if (this.selectedEvent.title.length >= 20) {
          this.openSnackBar('Заголовок недопустимой длины (максимум 20 символов)');
          return;
        } else {
          this.openSnackBar(error.error.message);
        }
      }
    );
  }

  deleteEvent(eventId: number) {
    this.eventService.removeEvent(eventId).subscribe(
      (response: any) => {
        this.openSnackBar('Событие успешно удалено');
        this.ngOnInit();
      },
      (error) => {
        this.openSnackBar(error.error.message);
      }
    );
  }
}

