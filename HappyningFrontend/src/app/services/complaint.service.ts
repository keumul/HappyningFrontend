import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private categoryUrl = 'http://localhost:5000/api/complaint';

  constructor(private http: HttpClient) {}

    findAllMessageComplaints(): Observable<any> {
        return this.http.get<any>(`${this.categoryUrl}/message`);
    }

    findAllEventComplaints(): Observable<any> {
        return this.http.get<any>(`${this.categoryUrl}/event`);
    }

    findEventComplaint(id: number): Observable<any> {
        return this.http.get<any>(`${this.categoryUrl}/event/${id}`);
    }

    findMessageComplaint(id: number): Observable<any> {
        return this.http.get<any>(`${this.categoryUrl}/message/${id}`);
    }

    createMessageComplaint(messageId: number, categoryId: number): Observable<any> {
        return this.http.post<any>(`${this.categoryUrl}/message/${messageId}/${categoryId}`, {});
    }

    createEventComplaint(eventId: number, categoryId: number): Observable<any> {
        return this.http.post<any>(`${this.categoryUrl}/event/${eventId}/${categoryId}`, {});
    }

    findAllComplaintsCategories(): Observable<any> {
        return this.http.get<any>(`${this.categoryUrl}/categories`);
    }

    createComplaintsCategory(dto: any): Observable<any> {
        return this.http.post<any>(`${this.categoryUrl}/categories`, dto);
    }

    findComplaintsCategory(id: number): Observable<any> {
        return this.http.get<any>(`${this.categoryUrl}/categories/${id}`);
    }

    updateComplaintsCategory(id: number, dto: any): Observable<any> {
        return this.http.patch<any>(`${this.categoryUrl}/categories/${id}`, dto);
    }

    removeComplaintsCategory(id: number): Observable<any> {
        return this.http.delete<any>(`${this.categoryUrl}/categories/${id}`);
    }
}
