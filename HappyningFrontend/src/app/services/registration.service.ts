import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  isRegistered: boolean = false;
  qrCode: string = '';
}
