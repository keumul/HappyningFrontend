import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../services/category.service';
import { Category } from '../dto/category.dto';
import { Event } from '../dto/event.dto';
import * as moment from 'moment';
import { UserService } from '../services/user.service';
import { User } from '../dto/user.dto';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent implements OnInit {
  event!: Event;
  category!: Category;
  organizer!: User;
  auxDate!: Date;
  startDate!: string;

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
      this.loadOrganizer()
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
}
