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
import { PreferenceService } from '../services/preference.service';

@Component({
  selector: 'app-event-registration',
  templateUrl: './event-registration.component.html',
  styleUrls: ['./event-registration.component.css'],
})
export class EventRegistrationComponent implements OnInit {

  participant!: Participant;
  participants?: Participant[];
  participantsFullInfo: Participant[] = [];
  user!: User;
  eventId!: number;
  userId!: number;
  isRegistered: boolean = false;
  message: any;
  userDetails?: { [userId: number]: { username: string, email: string } } = {};
  notification!: Notifications[];
  qrCode: string = '';
  event!: Event;
  openCaptcha: boolean = false;
  isOrganizer: boolean = false;
  filteredUsers: Participant[] = [];
  searchValue: number = 0;
  isOpenList: boolean = false;
  isQRCode: boolean = false;
  isChatOpen: boolean = false;

  constructor(
    private participantService: ParticipantService,
    private authService: AuthService,
    private eventService: EventService,
    private userService: UserService,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private registrationService: RegistrationService,
    private preferenceService: PreferenceService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.eventId = params['eventId'];
    });
    this.userId = this.authService.getCurrentUser()?.id;

    this.participantService
      .findAllEventParticipants(this.eventId)
      .pipe(switchMap(() => this.notificationService.findAllUserNotifications(this.userId)))
      .subscribe((data: Notifications[]) => {
        this.notification = data;
        this.updateQrCode();
      });

    this.findAllEventParticipants();

    this.eventService.getEventById(this.eventId).subscribe((data: Event) => {
      this.event = data;
      if(this.userId === this.event.organizerId) {
        this.isOrganizer = true;
        this.displayParticipantList();
      }
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

  customCaptcha() {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const question = `${num1} + ${num2}`;
    const answer = num1 + num2;
    return { question, answer };
  }

  tryToAddParticipant() {
    if(this.isRegistered) {
      return;
    }
    this.openCaptcha = true;
    const { question, answer } = this.customCaptcha();
    const userAnswer = prompt(`Please, solve a simple mathematical example: ${question}`);
    if (userAnswer === null) return;
    if (+userAnswer === answer) {
      this.addParticipant();
      this.openCaptcha = false;
    } else {
      this.openSnackBar('Incorrect answer');
    }
  }

  openChat() {
    this.isChatOpen = !this.isChatOpen;
    this.isOpenList = false;
    this.isQRCode = false;
  }

  addParticipant(): void {
    if (this.event.maxGuestAmount <= this.participants!.length) {
      this.openSnackBar('The maximum number of participants in the event has been reached');
      return;
    } else if (this.userId === this.event.organizerId) {
      this.openSnackBar('You cannot register for your own event');
      return;
    } else {
      this.participantService.addParticipant({
        eventId: this.eventId,
        userId: this.userId
      }).subscribe(
        (response: any) => {
          this.openSnackBar('You have successfully registered for this event!');
          this.findAllEventParticipants();
          this.ngOnInit();
          this.registrationService.isRegistered = true;
          this.preferenceService.addPreference(this.userId, 
            {categoryId: this.event.categoryId,
            formatId: this.event.formatId
          });
        },
        (error) => {
          this.openSnackBar('You are already registered for this event');
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
        this.openSnackBar('You are successfully removed from the event');
        this.findAllEventParticipants();
        this.isRegistered = false;
        this.updateQrCode();
        this.isChatOpen = false;
        this.isOpenList = false;
        this.isQRCode = false;
      },
      (error) => {
        this.message = 'You are not registered for this event';
      }
    );
  }

  showQrCode() {
    this.isQRCode = !this.isQRCode;
    this.isOpenList = false;
    this.isChatOpen = false;
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

  displayParticipantList() {
    this.participantService.findAllEventParticipants(this.eventId).subscribe(
      (response: any) => {
        this.participantsFullInfo = response;
        this.filteredUsers = this.participantsFullInfo;
      },
      (error) => {
        this.message = 'Something went wrong, please try again later.';
      }
    );
  }

  applyFilter(filterValue: number) {
    const filter = filterValue.toString().toLowerCase();
    this.filteredUsers = this.participantsFullInfo.filter(user => user.userId.toString().toLowerCase().includes(filter));
  } 

  openList() {
    this.isOpenList = !this.isOpenList;
    this.isQRCode = false;
    this.isChatOpen = false;
  }

  openStatistics() {
    this.isOpenList = false;
    this.isQRCode = false;
    this.isChatOpen = false;
  }
}
