import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../dto/category.dto';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://localhost:5000/api/categories';

  constructor(private http: HttpClient) {}

  createCategory(dto: Category): Observable<any> {
    return this.http.post<any>(this.baseUrl, dto);
  }

  findAllCategories(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  findCategory(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  updateCategory(id: number, dto: Category): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, dto);
  }

  removeCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
