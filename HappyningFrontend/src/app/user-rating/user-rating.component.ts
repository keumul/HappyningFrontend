import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { RateUser } from '../dto/rate-user.dto';
import { Event } from '../dto/event.dto';
import { NavigationEnd, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../services/event.service';
import { ParticipantService } from '../services/participant.service';
import { Participant } from '../dto/participant.dto';
import { User } from '../dto/user.dto';

@Component({
  selector: 'app-user-rating',
  templateUrl: './user-rating.component.html',
  styleUrls: ['./user-rating.component.css']
})
export class UserRatingComponent implements OnInit {
  userId: number | undefined;
  usersInfoMap: Map<number, User> = new Map();
  eventsInfoMap: Map<number, Event> = new Map();
  userRate!: RateUser[];
  canRate: boolean = true;
  newRating: number = 5;
  newComment: string = "";
  currentUser!: number;
  events: Event[] = [];
  event!: Event;
  limit = 0;

  constructor(private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar,
    private eventService: EventService,
    private participantService: ParticipantService
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = params['userId'] ? +params['userId'] : undefined;
      this.loadUserRating();
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.route.paramMap.subscribe(params => {
          const userId = params.get('id');
          this.userId = userId ? +userId : undefined;
          this.loadUserRating();
        });
      }
    });

    this.userService.whoAmI().subscribe((user) => {
      this.currentUser = user.id;
      console.log(this.currentUser);
      this.loadEvents();
      if (this.userId && this.userId != this.currentUser) {
        this.canRate = true;
      } else {
        this.canRate = false;
      }
    });
    this.loadUserRating();
    await this.loadUserInfoAndEventInfo();
  }


  loadUserRating() {
    if (this.userId) {
      this.userService.viewUserRate(this.userId).subscribe((data: RateUser[]) => {
        this.userRate = data;
      });

    } else {
      this.currentUserRate();
    }
  }

  async loadUserInfoAndEventInfo() {
    const usersInfo = await this.userService.findAllUsers().toPromise();
    this.usersInfoMap = new Map(usersInfo!.map(user => [user.id, user]));
    const eventsInfo = await this.eventService.getAllEvents().toPromise();
    this.eventsInfoMap = new Map(eventsInfo!.map(event => [event.id, event]));

    await this.loadUserRating();
  }

  loadEvents() {
    this.participantService.findUserEvents(this.currentUser).subscribe((data: Participant[]) => {
      for (let i = 0; i < data.length; i++) {
        this.eventService.getEventById(data[i].eventId).subscribe((event: Event) => {
          if (event.organizerId == this.userId && this.limit < 2) {
            this.events.push(event);
          }
        })
      }
    })
    this.limit++;
  }

  currentUserRate() {
    this.userService.findCurrentUserRate().subscribe((data: any) => {
      console.log(data);
      this.userRate = data;
    });
  }

  calculateAverageRating(): number {
    if (this.userRate && this.userRate.length > 0) {
      const totalRating = this.userRate.reduce((sum, rate) => sum + rate.rate, 0);
      return +(totalRating / this.userRate.length).toFixed(2);
    } else {
      return 0;
    }
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 2000,
      panelClass: ['blue-snackbar']
    })
  }

  starsArray(): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1);
  }

  submitRating() {
    if (this.canRate && this.userId) {
      this.userService.rateUser(+this.userId,
        +this.event,
        {
          rate: this.newRating,
          message: this.newComment
        }).subscribe((response) => {
          this.openSnackBar('The review was successfully added');
          this.loadUserRating();
          this.newRating = 5;
          this.newComment = "";
        },
          (error) => {
            this.openSnackBar('An error occurred while adding the review');
          }
        );
    }
  }
}
