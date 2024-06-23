import { Component } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  constructor() { }
  ngOnInit() {
    this.isLogin = true
    this.buttonText = 'Dont have an account?'
  }
  isLogin!: boolean
  buttonText!: string
  changeMode() {
    this.isLogin = !this.isLogin
    this.isLogin ? this.buttonText = 'Dont have an account?' : this.buttonText = 'Already registered?'
  }
}
