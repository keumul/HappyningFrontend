import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private baseUrl = 'http://localhost:5000/api/notifications';

  constructor(private http: HttpClient) {}

  createNotification(notificationDto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, notificationDto);
  }

  findAllUserNotifications(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${id}`);
  }

  pickNotification(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}
