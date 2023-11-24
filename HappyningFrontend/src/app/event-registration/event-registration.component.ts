import { Component, OnInit } from '@angular/core';
import { ParticipantService } from '../services/participant.service';
import { Participant } from '../dto/participant.dto';
import { CategoryService } from '../services/category.service';
import { EventService } from '../services/event.service';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../dto/user.dto';

@Component({
  selector: 'app-event-registration',
  templateUrl: './event-registration.component.html',
  styleUrls: ['./event-registration.component.css']
})
export class EventRegistrationComponent implements OnInit {

  participant!: Participant;
  participants!: Participant[];
  user!: User;
  eventId!: number;
  userId!: number;
  isRegistered: boolean = false;
  message: any;

  constructor(private participantService: ParticipantService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private userService: UserService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventId = params['eventId'];
    });
    this.userId = this.authService.getCurrentUser()?.id;
    this.isUserRegistered();
  }

  addParticipant(): void {
      this.participantService.addParticipant({
        eventId: this.eventId,
        userId: this.userId
      }).subscribe((response: any) => {
        this.message = 'Вы успешно зарегистрировались на это событие'
        this.ngOnInit();
      },
        (error) => {
          this.message = 'Вы уже зарегистрированы на это событие'
        });
  }

  findAllEventParticipants(): void {
    this.participantService.findAllEventParticipants(this.eventId).subscribe((response: any) => {
      this.participants = response;
      this.participants.forEach((participant: any) => {
        this.loadUser(participant.userId);
      })
    },
      (error) => {
        console.error(error);
      });
  }

  findEventParticipant(): void {
    this.participantService.findEventParticipant(this.eventId, {}).subscribe(response => {
      // Обработка ответа
    });
  }

  findUserEvents(): void {
    this.participantService.findUserEvents(this.userId).subscribe(response => {
      // Обработка ответа
    });
  }

  removeEventParticipant(): void {
    this.participantService.removeEventParticipant(this.eventId)
    .subscribe((response: any) => {
      this.message = 'Вы успешно отменили регистрацию на это событие'
      this.ngOnInit();
    },
      (error) => {
        this.message = 'Вы еще не зарегистрированы на это событие'
      });
  }

  loadUser(id: number) {
    this.userService.findUser(id).subscribe((data: any) => {
      this.user = data;
    })
  }

  isUserRegistered() {
    this.participantService.findEventParticipant(this.eventId, {
      userId: this.userId,
      eventId: this.eventId
    }).subscribe((response: any) => {
      this.isRegistered = true;
      console.log(response);
      
    },
      (error) => {
        this.isRegistered = false;
      });
  }
}
