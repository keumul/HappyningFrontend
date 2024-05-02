import { Component, ElementRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { PreferenceService } from '../services/preference.service';
import { CategoryService } from '../services/category.service';
import { UserService } from '../services/user.service';
import { User } from '../dto/user.dto';
import { Category } from '../dto/category.dto';
import { Format } from '../dto/format.dto';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-preference',
  templateUrl: './preference.component.html',
  styleUrls: ['./preference.component.css']
})
export class PreferenceComponent {

  currentUser!: User;
  categories: Category[] = [];
  formats: Format[] = [];
  selectedCategory: Category[] = [];
  selectedFormat: Format[] = [];
  isSelectedCategory: { [categoryId: number]: boolean } = {};
  isSelectedFormat: { [formatId: number]: boolean } = {};

  constructor(
    private userService: UserService,
    private preferenceService: PreferenceService,
    private categoryService: CategoryService,
    private elementRef: ElementRef,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.userService.whoAmI().subscribe((user) => {
      this.currentUser = user;
    });
    this.loadCategories();
    this.loadFormats();
  }

  loadCategories() {
    this.categoryService.findAllCategories().subscribe((data: any) => {
      this.categories = data;
      for (let category of this.categories) {
        this.isSelectedCategory[category.id] = false;
      }
    });
  }

  loadFormats() {
    this.categoryService.findAllFormats().subscribe((data: any) => {
      this.formats = data;
      for (let format of this.formats) {
        this.isSelectedFormat[format.id] = false;
      }
    });
  }

  addCategoryPreference(category: Category) {
    if (this.isSelectedCategory[category.id] === false) {
      this.isSelectedCategory[category.id] = true;
      this.selectedCategory.push(category);
    } else {
      this.isSelectedCategory[category.id] = false;
      this.selectedCategory = this.selectedCategory.filter((c) => c.id !== category.id);
    }
  }

  addFormatPreference(format: Format) {
    if (this.isSelectedFormat[format.id] === false) {
      this.isSelectedFormat[format.id] = true;
      this.selectedFormat.push(format);
    } else {
      this.isSelectedFormat[format.id] = false;
      this.selectedFormat = this.selectedFormat.filter((f) => f.id !== format.id);
    }
  }

  submitPreferences() {
    if(this.selectedCategory.length === 0 || this.selectedFormat.length === 0) {
      this.snackBar.open('Please select at least one category or one format', '', {duration: 2000});
      return;  
    }

    for (let category of this.selectedCategory) {
      for (let format of this.selectedFormat) {
        this.preferenceService.addPreference(this.currentUser.id,
          { categoryId: category.id, formatId: format.id }).subscribe((data) => {
            this.router.navigate(['/home']);
          });
      }
    }
  }
}
