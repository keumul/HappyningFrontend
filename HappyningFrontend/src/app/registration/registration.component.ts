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
  constructor(private authService: AuthService,
    private router: Router
  ) { }

  registerUser() {
    try {

      this.bday = new Date(this.bday);
      if (this.bday >= new Date()) {
        this.errorMessage = 'Invalid birthday'
        return;
      }
      this.authService.registerUser(this.username, this.password, this.email, this.bday, this.role).subscribe(data => {
        this.errorMessage = ''
        this.username = ''
        this.username = ''
        this.email = ''
        this.bday = new Date()
        this.isLogin = true;
        this.router.navigate(['/login']);
      }, err => {

        if (err.error.message == 'email must be an email') {
          this.errorMessage = 'The mail has an incorrect format';
          return;
        } else if (err.error.message == 'User already exists') {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Fill in the empty fields';
        }
      })
  } catch(error) {
    console.log(error);
  }
}
}
