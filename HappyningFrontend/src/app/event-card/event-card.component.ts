import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../services/category.service';
import { Category } from '../dto/category.dto';
import { Event } from '../dto/event.dto';
import * as moment from 'moment';
import { UserService } from '../services/user.service';
import { User } from '../dto/user.dto';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css'],
})

export class EventCardComponent implements OnInit {
  event!: Event;
  category!: Category;
  organizer!: User;
  auxDate!: Date;
  startDate!: string;
  codeFromDatabase: string = '';
  isOverlayVisible: boolean = false;
  enteredCode: string = '';

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    var id = 0;
    this.route.params.subscribe(params => {
      id = params['eventId'];
    });
    this.eventService.getEventById(id).subscribe((data: Event) => {
      this.event = data;
      this.auxDate = new Date(this.event.startDate);
      this.startDate = moment().format('YYYY.MM.DD HH:MM');
      this.loadCategory();
      this.loadOrganizer();
      if (!this.event.isPublic) {
        this.codeFromDatabase = this.event.secretCode;
        this.openOverlay();
      }
    });
  }

  loadCategory() {
    this.categoryService.findCategory(this.event.categoryId).subscribe((data: any) => {
      this.category = data as Category;
    })
  }

  loadOrganizer() {
    this.userService.findUser(this.event.organizerId).subscribe((data: any) => {
      this.organizer = data as User;
    })
  }

  navigateToUserProfile(userId: number) {
    this.router.navigate([`user/${userId}`]);
  }

  openOverlay() {
    this.isOverlayVisible = true;
  }

  closeOverlay() {
    this.isOverlayVisible = false;
    this.enteredCode = '';
    this.router.navigate(['/home']);
  }

  onOverlaySubmit() {
    console.log('Entered Code:', this.enteredCode);
    if (this.enteredCode === this.codeFromDatabase) {
      console.log('Correct code!');
      this.closeOverlay();
    } else {
      console.log('Incorrect code!');
    }
  }
}
