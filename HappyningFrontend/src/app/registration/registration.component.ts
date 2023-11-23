import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  ngOnInit(): void {
    this.errorMessage = ''
    this.successMessage = ''
  }
  constructor(private authService: AuthService) { }

  registerUser() {
    try {
      this.authService.registerUser(this.username, this.password, this.email, this.bday).subscribe(data => {
        this.username = ""
        this.password = ""
        this.email = ""
        this.bday = new Date()
        this.successMessage = 'Регистрация прошла успешно!'

      }, err => {
        this.errorMessage = 'Попробуйте еще раз'
      })

    } catch (error) {
      console.log(error);
    }

  }

  successMessage?: string;
  errorMessage?: string;
  username!: string;
  password!: string;
  email!: string;
  bday!: Date;
}
