import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../dto/category.dto';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoryUrl = 'http://localhost:5000/api/categories';
  private formatUrl = 'http://localhost:5000/api/formats';

  constructor(private http: HttpClient) {}

  createCategory(dto: Category): Observable<any> {
    return this.http.post<any>(this.categoryUrl, dto);
  }

  findAllCategories(): Observable<any> {
    return this.http.get<any>(this.categoryUrl);
  }

  findSubcategories(id: number): Observable<any> {
    return this.http.get<any>(`${this.categoryUrl}/subcategories/${id}`);
  }

  findCategory(id: number): Observable<any> {
    return this.http.get<any>(`${this.categoryUrl}/${id}`);
  }

  updateCategory(id: number, dto: Category): Observable<any> {
    return this.http.patch<any>(`${this.categoryUrl}/${id}`, dto);
  }

  removeCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.categoryUrl}/${id}`);
  }

  createFormat(dto: any): Observable<any> {
    return this.http.post<any>(this.formatUrl, dto);
  }

  findAllFormats(): Observable<any> {
    return this.http.get<any>(this.formatUrl);
  }

  findFormat(id: number): Observable<any> {
    return this.http.get<any>(`${this.formatUrl}/${id}`);
  }

  updateFormat(id: number, dto: any): Observable<any> {
    return this.http.patch<any>(`${this.formatUrl}/${id}`, dto);
  }

  removeFormat(id: number): Observable<any> {
    return this.http.delete<any>(`${this.formatUrl}/${id}`);
  }

}
