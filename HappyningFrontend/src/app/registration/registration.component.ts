import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  isLogin: boolean = false;
  successMessage?: string;
  errorMessage?: string;
  username!: string;
  password!: string;
  email!: string;
  bday!: Date;

  ngOnInit(): void {
    this.errorMessage = ''
    this.successMessage = ''
  }
  constructor(private authService: AuthService) { }

  registerUser() {
    try {
      if (this.bday >= new Date()) {
        this.errorMessage = 'Некорректная дата'
        return
      }
      this.authService.registerUser(this.username, this.password, this.email, this.bday).subscribe(data => { 
        this.errorMessage = ''
        this.username = ''
        this.password = ''
        this.email = ''
        this.bday = new Date()
        this.isLogin = true;
      }, err => {
        if (err.status == 403) {
          this.errorMessage = 'Такой пользователь уже существует'
          return
        } else if (err.status == 400) {
          this.errorMessage = 'Некорректные данные'
          return
        } 
      })
    } catch (error) {
      console.log(error);
    }

  }
}
