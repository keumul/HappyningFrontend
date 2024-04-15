import { Component, OnInit } from '@angular/core';
import { User } from '../dto/user.dto';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user!: User;
  currentUser!: User;
  ageMessage!: string;
  message!: string;
  exitMessage!: string;
  isEvents = false;

  constructor(
    private userService: UserService) { }

  ngOnInit(): void {
    this.userService.whoAmI().subscribe((user) => {
      this.currentUser = user;
      this.user = user;
      this.calculateAgeMessage();
      console.log(this.currentUser);
    });
  }

  openEvents() {
    this.isEvents = !this.isEvents;
  }

  calculateAgeMessage(): void {
    if (this.currentUser.bday) {
      const birthDate = new Date(this.currentUser.bday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 16) {
        this.ageMessage = 'Recommended age is 16+';
      } else {
        this.ageMessage = '';
      }
    }
  }

  updateUser(): void {

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.currentUser.email)) {
      this.message = 'Enter a valid email address';
      return;
    }

    this.userService.updateUser(this.currentUser.id, this.currentUser).subscribe(() => {
      this.message = '';
    },
      (error) => {
        this.message = error.error.message;
      }
    )
  }
}
