import { Component, OnInit } from "@angular/core";
import { UserService } from "../services/user.service";
import { User } from "../dto/user.dto";
import { CategoryService } from "../services/category.service";
import { Category } from "../dto/category.dto";

type NewType = OnInit;

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements NewType {
  users!: User[];
  categories!: Category[];
  selectedCategory: Category = { id: 0, title: '', description: '' };
  isEditing = false;
  rate!: number;

  constructor(private userService: UserService,
    private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.getUsersList();
    this.loadCategories();
  }

  getUsersList() {
    this.userService.findAllUsers().subscribe(
      (data: User[]) => {
        this.users = data.filter(user => !user.isAdmin);
      },
      (error) => {
        console.error('Error loading users', error);
      }
    );
  }

  loadCategories(): void {
    this.categoryService.findAllCategories().subscribe(
      (data) => {
        this.categories = data.filter((category: { id: number; }) => category.id != 1);
      },
      (error) => {
        console.error('Error loading categories', error);
      }
    );
  }

  updateCategory(id: number): void {
    this.categoryService.updateCategory(id, this.selectedCategory).subscribe(
      () => {
        this.loadCategories();
        this.selectedCategory = { id: 0, title: '', description: '' };
      },
      (error) => {
        console.error('Error updating category', error);
      }
    );
  }

  deleteCategory(id: number): void {
    this.categoryService.removeCategory(id).subscribe(
      () => {
        this.loadCategories();
        this.selectedCategory = { id: 0, title: '', description: '' };
      },
      (error) => {
        console.error('Error deleting category', error);
      }
    );
  }

  createCategory(): void {
    if (this.isEditing) {
      this.updateCategory(this.selectedCategory.id);
    } else {
      this.categoryService.createCategory(this.selectedCategory).subscribe(
        () => {
          this.loadCategories();
        },
        (error) => {
          console.error('Error creating category', error);
        }
      );
    }
  }

  startEditing(category: Category): void {
    this.selectedCategory = { ...category };
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.selectedCategory = { id: 0, title: '', description: '' };
    this.isEditing = false;
  }

  deleteUser(id: number) {
    this.userService.removeUser(id).subscribe(() => {
      this.getUsersList();
    });
  }

  rateUser(rateData: any) {
  }

  onGetUsersButtonClick() {
    this.getUsersList();
  }

  onRateUserButtonClick(userId: number) {
    this.rateUser(userId);
    this.getUsersList();
  }
}
