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
    this.buttonText = 'Нет аккаунта? Регистрируйся!'
  }
  isLogin!: boolean
  buttonText!: string
  changeMode() {
    this.isLogin = !this.isLogin
    this.isLogin ? this.buttonText = 'Нет аккаунта? Регистрируйся!' : this.buttonText = 'Есть аккаунт?'
  }
}
