import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor( private router: Router) { }
  ngOnInit(): void {
    this.errorMessage = ''
  }

  checkCredentials() {
    try {}
    catch (e) {}
    
  }
  errorMessage?: string
  username!: string;
  password!: string;
}
