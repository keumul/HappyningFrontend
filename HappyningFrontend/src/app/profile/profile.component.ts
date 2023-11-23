import { Component, OnInit } from '@angular/core';
import { User } from '../dto/user.dto';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser!: User;
  bdayFormatted!: string;
  ageMessage!: string;
  exitMessage!: string;
  isExitMessageShown!: boolean;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.whoAmI().subscribe((user) => {
      this.currentUser = user;
      this.formatDate();
      this.calculateAgeMessage();
    });
  }

  formatDate(): void {
    if (this.currentUser.bday) {
      const date = new Date(this.currentUser.bday);
      this.bdayFormatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  }

  calculateAgeMessage(): void {
    if (this.currentUser.bday) {
      const birthDate = new Date(this.currentUser.bday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 16) {
        this.ageMessage = 'Настоятельно рекомендуем перед посещением любого мероприятия ставить в известность ответственных взрослых!';
      } else {
        this.ageMessage = '';
      }
    }
  }

  showText(): void {
    this.exitMessage = 'Пользователь, ты уверен, что хочешь уйти?';
    this.isExitMessageShown = true;
   
  }

  hideText(): void {
    this.exitMessage = '';
    this.isExitMessageShown = false;
  }
}
