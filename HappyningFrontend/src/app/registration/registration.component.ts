import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  isLogin: boolean = false;
  errorMessage?: string;
  username!: string;
  password!: string;
  email!: string;
  bday!: Date;
  role: string = "user";
  currentDate = new Date();
  bdayForm!: FormGroup;

  ngOnInit(): void {
    this.errorMessage = ''
  }
  constructor(private authService: AuthService) { }

  registerUser() {
    try {
      if (this.bday >= new Date()) {
        this.errorMessage = 'Invalid birthday'
        return
      }
      console.log(this.bday);
      this.bday = new Date(this.bday);
      this.authService.registerUser(this.username, this.password, this.email, this.bday, this.role).subscribe(data => {
        this.errorMessage = ''
        this.username = ''
        this.password = ''
        this.email = ''
        this.bday = new Date()
        this.isLogin = true;
      }, err => {
        this.errorMessage = err.error.message
        console.log(err);
        
      })
    } catch (error) {
      console.log(error);
      
    }

  }
}
