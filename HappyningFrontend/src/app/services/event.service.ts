// event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private baseUrl = 'http://localhost:5000/api/events';
  private userUrl = 'http://localhost:5000/api/participants';

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  getAllEventsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.userUrl}/all/user/${userId}`);
  }

  getUserEvents(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/${userId}`);
  }

  getEventById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createEvent(eventDto: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, eventDto);
  }

  updateEvent(id: number, eventDto: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, eventDto);
  }

  removeEvent(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  rateEvent(id: number, rateDto: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/rate/${id}`, rateDto);
  }

  viewEventRate(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rate/${id}`);
  }

  removeEventRate(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/rate/${id}`);
  }
}
