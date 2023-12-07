import { Component, OnInit } from '@angular/core';
import { ParticipantService } from '../services/participant.service';
import { Participant } from '../dto/participant.dto';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../dto/user.dto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../services/notification.service';
import { Notifications } from '../dto/notification.dto';
import { switchMap } from 'rxjs';
import { RegistrationService } from '../services/registration.service';
import { EventService } from '../services/event.service';
import { Event } from '../dto/event.dto';
import { UserService } from '../services/user.service';

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
  notification!: Notifications[];
  qrCode: string = '';
  event!: Event;

  constructor(
    private participantService: ParticipantService,
    private authService: AuthService,
    private eventService: EventService,
    private userService: UserService,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private registrationService: RegistrationService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.eventId = params['eventId'];
    });
    this.userId = this.authService.getCurrentUser()?.id;

    this.participantService
      .findAllEventParticipants(this.eventId)
      .pipe(switchMap(() => this.notificationService.findAllNotifications()))
      .subscribe((data: Notifications[]) => {
        this.notification = data;
        this.updateQrCode();
      });

    this.findAllEventParticipants();

    this.eventService.getEventById(this.eventId).subscribe((data: Event) => {
      this.event = data;
    });
  }

  private updateQrCode(): void {
    if (this.isRegistered) {
      const matchingNotification = this.notification.find((item) => {
        if (item.qrCode === null) return false;
        return item.eventId === +this.eventId;
      });

      if (matchingNotification) {
        this.qrCode = matchingNotification.qrCode;
        console.log('qr', matchingNotification.qrCode);
      } else {
        this.registrationService.qrCode = '';
      }
    } else {
      this.registrationService.qrCode = '';
    }
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 2000,
      panelClass: ['blue-snackbar']
    });
  }

  addParticipant(): void {
    if (this.event.maxGuestAmount <= this.participants!.length) {
      
      this.openSnackBar('Достигнуто максимальное количество участников');
      return;
    } else if (this.userId === this.event.organizerId) {
      this.openSnackBar('Вы не можете зарегистрироваться на свое же событие :)');
      return;
    } else {
      this.participantService.addParticipant({
        eventId: this.eventId,
        userId: this.userId
      }).subscribe(
        (response: any) => {
          this.openSnackBar('Вы успешно зарегистрировались на это событие');
          this.findAllEventParticipants();
          this.ngOnInit();
          this.registrationService.isRegistered = true;
        },
        (error) => {
          this.openSnackBar('Вы уже зарегистрированы на это событие');
        }
      );
    }
  }

  findAllEventParticipants(): void {
    this.participantService.findAllEventParticipants(this.eventId).subscribe(
      (response: any) => {
        this.participants = response;
        this.participants?.forEach((participant: any) => {
          if (participant.userId === this.userId) {
            this.isRegistered = true;
          }
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
        this.isRegistered = false;
        this.updateQrCode();

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
