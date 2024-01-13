import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  errorMessage?: string
  username!: string;
  password!: string;
  user!: any;

  constructor(private authService: AuthService) { }

  isUser: boolean = false;

  ngOnInit(): void {
    this.errorMessage = ''
    this.checkCredentials();
  }

  checkCredentials() {
    try {
        if (this.authService.getCurrentUser()) {
          this.isUser = true;
        } else {
          this.isUser = false;
        }
    } catch (error) {
      console.log(error);
    }
  }
}
