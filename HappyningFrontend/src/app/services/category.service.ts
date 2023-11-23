import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private baseUrl = 'http://localhost:5000/api/categories';

    constructor(private http: HttpClient) { }

    findAllCategories() {
        return this.http.get(`${this.baseUrl}`);
    }

    findCategory(id: number) {
        return this.http.get(`${this.baseUrl}/${id}`);
    }
}