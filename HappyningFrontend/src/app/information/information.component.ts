import { Component, Input } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { Format } from '../dto/format.dto';
import { Category } from '../dto/category.dto';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent {
  formats: Format[] = [];
  categories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadFormats();
  }

  loadCategories(): void {
    this.categoryService.findAllCategories().subscribe(
      (data) => {
        this.categories = data;
      },
      (error) => {
        console.error('Error loading categories', error);
      }
    );
  }

  loadFormats(): void {
    this.categoryService.findAllFormats().subscribe(
      (data) => {
        this.formats = data;
      },
      (error) => {
        console.error('Error loading formats', error);
      }
    );
  }
}
