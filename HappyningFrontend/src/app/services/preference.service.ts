import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PreferenceService {
    private baseUrl = 'http://localhost:5000/api/preferences';

    constructor(private http: HttpClient) { }

    getPreferencesByUser(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/${id}`);
    }

    addPreference(id: number, dto: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/${id}`, dto);
    }

    updatePreference(id: number, dto: any): Observable<any> {
        return this.http.patch<any>(`${this.baseUrl}/${id}`, dto);
    }

    sortedCategoriesPreference(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/sort/category/${id}`);
    }

    sortedFormatsPreference(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/sort/format/${id}`);
    }
}
