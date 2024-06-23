import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../dto/user.dto';
import { Event } from '../dto/event.dto';
import { EventService } from '../services/event.service';
import { ParticipantService } from '../services/participant.service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../services/category.service';
import { Category } from '../dto/category.dto';
import { Format } from '../dto/format.dto';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  userId!: number;
  event!: Event;
  category!: Category;
  formats!: Format;

  ages: number[] = [];
  agesCount: any[] = [{ age: [], amount: [] }];
  participants: any[] = [];
  labels: any[] = [];
  amounts: any[] = [];
  mostPopularEvent!: Event;
  mostPopularCategory!: [{ title: string, count: number }];
  mostPopularFormat!: [{ title: string, count: number }];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private eventService: EventService,
    private participantService: ParticipantService,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.userId = this.authService.getCurrentUser()?.id;
    this.getMostPopularEventInfo();
    if (this.agesCount.length > 0 && this.agesCount[0].age.length === 0) {
      this.agesCount.shift();
    }
  }

  redirectToEvent(eventId: number) {
    window.location.href = `/event/${eventId}`;
  }

  getParticipantsInfo(): void {
    this.participantService.findAllEventParticipants(this.event.id).subscribe((participants: any[]) => {
      participants.forEach(participant => {
        this.userService.findUser(participant.userId).subscribe((user: User) => {
          this.participants.push(user);
        });
      })
      this.getParticipantsAge();
    });
  }

  getParticipantsAge(): void {
    this.participantService.findEventParticipantsAge(this.event.id).subscribe((ages: any[]) => {
      ages.forEach(bday => {
        const age = new Date().getFullYear() - new Date(bday.user.bday).getFullYear();
        this.ages.push(age);
      });
      this.calculateCountOfAges();
    });
  }

  calculateCountOfAges(): void {
    this.ages.forEach(age => {
      if (!this.agesCount.find(item => item.age === age)) {
        this.agesCount.push({ age: age, amount: 1 });
        this.labels.push(age);
        this.amounts.push(1);
      } else {
        this.agesCount.find(item => item.age === age).amount += 1;
        this.amounts[this.labels.indexOf(age)] += 1;
      }
    });
  }

  getMostPopularEventInfo(): void {
    this.participantService.findMostPopularEvent().subscribe((event: any) => {
      this.eventService.getEventById(event[0].eventId).subscribe((data: Event) => {
        this.mostPopularEvent = data;
        this.loadPopularCategory();
        this.loadPopularFormat();
        this.getMostPopularCategory();
        this.getMostPopularFormat();
      });
    })
  }

  getMostPopularCategory(): void {
    this.participantService.findMostPopularCategory().subscribe((category: any) => {
      const cat = Object.keys(category)[0]
      this.categoryService.findCategory(parseInt(cat)).subscribe((data: Category) => {
        this.mostPopularCategory = [{ title: data.title, count: category[cat] }];
      });
    });
  }

  getMostPopularFormat(): void {
    this.participantService.findMostPopularFormat().subscribe((format: any) => {
      const form = Object.keys(format)[0];
      this.categoryService.findFormat(parseInt(form)).subscribe((data: Format) => {
        this.mostPopularFormat = [{ title: data.title, count: format[form] }];
        console.log('4', this.mostPopularFormat);
      });
    });
  }

  loadPopularCategory(): void {
    this.categoryService.findCategory(this.mostPopularEvent.categoryId).subscribe((data: Category) => {
      this.category = data;
      console.log('1', this.category);
      
    });
  }

  loadPopularFormat(): void {
    this.categoryService.findFormat(this.mostPopularEvent.formatId).subscribe((data: Format) => {
      this.formats = data;
      console.log('2', this.formats);
      
    });
  }
}
