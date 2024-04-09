import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PhotoDto } from '../dto/photo.dto';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private eventUrl = 'http://localhost:5000/api/events';
  private participantUrl = 'http://localhost:5000/api/participants';

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.eventUrl}`);
  }

  getAllEventsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.participantUrl}/all/user/${userId}`);
  }

  getUserEvents(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.eventUrl}/user/${userId}`);
  }

  getEventById(id: number): Observable<any> {
    return this.http.get<any>(`${this.eventUrl}/${id}`);
  }

  createEvent(eventDto: any): Observable<any> {
    return this.http.post<any>(`${this.eventUrl}`, eventDto);
  }

  updateEvent(id: number, eventDto: any): Observable<any> {
    return this.http.patch<any>(`${this.eventUrl}/${id}`, eventDto);
  }

  removeEvent(id: number): Observable<any> {
    return this.http.delete<any>(`${this.eventUrl}/${id}`);
  }

  rateEvent(id: number, rateDto: any): Observable<any> {
    return this.http.post<any>(`${this.eventUrl}/rate/${id}`, rateDto);
  }

  viewEventRate(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.eventUrl}/rate/${id}`);
  }

  removeEventRate(id: number): Observable<any> {
    return this.http.delete<any>(`${this.eventUrl}/rate/${id}`);
  }

  uploadImage(id: number, dto: PhotoDto): Observable<any> {
    return this.http.post<any>(`http://localhost:5000/api/photos/upload/${id}`, dto);
  }

}
