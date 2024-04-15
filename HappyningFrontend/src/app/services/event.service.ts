import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private eventUrl = 'http://localhost:5000/api/events';
  private participantUrl = 'http://localhost:5000/api/participants';
  private photoUrl = 'http://localhost:5000/api/photos';

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

  uploadImage(id: number, dto: any): Observable<any> {
    return this.http.post<any>(`${this.photoUrl}/upload/${id}`, dto);
  }

  getImages(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.photoUrl}/${id}`);
  }

  showImage(id: number): Observable<string> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.get(`${this.photoUrl}/show/${id}`, {headers: headers, responseType: 'text' });
  }

  deleteImage(id: number): Observable<any> {
    return this.http.delete<any>(`${this.photoUrl}/${id}`);
  }

}
