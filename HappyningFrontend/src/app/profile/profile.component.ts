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
  currentUser!: User;
  ageMessage!: string;
  exitMessage!: string;
  isExitMessageShown!: boolean;

  constructor(
    private userService: UserService,
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.userService.whoAmI().subscribe((user) => {
      this.currentUser = user;
      this.calculateAgeMessage();
    });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 2000,
      panelClass: ['blue-snackbar']
    })
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

  updateUser(): void {
    this.userService.updateUser(this.currentUser.id, this.currentUser).subscribe(() => {
      this.openSnackBar('Данные успешно обновлены');
    });
  }
}
