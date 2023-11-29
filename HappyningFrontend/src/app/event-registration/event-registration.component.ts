import { Component, OnInit } from '@angular/core';
import { ParticipantService } from '../services/participant.service';
import { Participant } from '../dto/participant.dto';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../dto/user.dto';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-event-registration',
  templateUrl: './event-registration.component.html',
  styleUrls: ['./event-registration.component.css'],
})
export class EventRegistrationComponent implements OnInit {

  participant!: Participant;
  participants?: Participant[];
  user!: User;
  eventId!: number;
  userId!: number;
  isRegistered: boolean = false;
  message: any;
  userDetails?: { [userId: number]: { username: string, email: string } } = {};

  constructor(
    private participantService: ParticipantService,
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.eventId = params['eventId'];
    });
    this.userId = this.authService.getCurrentUser()?.id;
    this.isUserRegistered();
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 2000,
      panelClass: ['blue-snackbar']
    });
  }

  addParticipant(): void {
    this.participantService.addParticipant({
      eventId: this.eventId,
      userId: this.userId
    }).subscribe(
      (response: any) => {
        this.openSnackBar('Вы успешно зарегистрировались на это событие');
        this.findAllEventParticipants();
        this.ngOnInit();
      },
      (error) => {
        this.openSnackBar('Вы уже зарегистрированы на это событие');
      }
    );
  }

  findAllEventParticipants(): void {
    this.participantService.findAllEventParticipants(this.eventId).subscribe(
      (response: any) => {
        this.participants = response;
        this.participants?.forEach((participant: any) => {
          this.loadUser(participant.userId);
        });
      },
      (error) => {
        this.openSnackBar(error.error.message);
      }
    );
  }

  loadUser(userId: number): void {
    this.userService.findUser(userId).subscribe(
      (data: any) => {
        this.userDetails![userId] = { username: data.username, email: data.email };
      },
      (error) => {
        console.error('Error loading user details:', error);
      }
    );
  }

  removeEventParticipant(): void {
    this.participantService.removeEventParticipant(this.eventId).subscribe(
      (response: any) => {
        this.openSnackBar('Вы успешно отменили регистрацию на это событие');
        this.findAllEventParticipants();
        this.ngOnInit();
      },
      (error) => {
        this.message = 'Вы еще не зарегистрированы на это событие';
      }
    );
  }

  isUserRegistered() {
    this.participantService.findEventParticipant(this.eventId, {
      userId: this.userId,
      eventId: this.eventId
    }).subscribe(
      (response: any) => {
        this.isRegistered = true;
        console.log(response);
      },
      (error) => {
        this.isRegistered = false;
      }
    );
  }
}
