import { Component, OnInit } from "@angular/core";
import { UserService } from "../services/user.service";
import { User } from "../dto/user.dto";
import { CategoryService } from "../services/category.service";
import { Category } from "../dto/category.dto";
import { Event } from "../dto/event.dto";
import { EventService } from "../services/event.service";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

type NewType = OnInit;

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements NewType {
  users!: User[];
  events!: Event[];
  categories!: Category[];
  selectedCategory: Category = { id: 0, title: '', description: '', parentId: 0};
  isEditing = false;
  filteredUsers: User[] = [];
  searchValue: number = 0;
  categoryEventCounts: { [categoryId: number]: number } = {};
  isAdmin: boolean = false;
  isUser: boolean = false;

  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private eventSerice: EventService,
    private authService: AuthService,
    private router: Router) {}

  ngOnInit(): void {
    this.checkCredentials();
    this.getUsersList();
    this.loadCategories();
    this.loadEvents();
    this.calculateCategoryEventCounts();
  }

  checkCredentials() {
    try {
        if (this.authService.getCurrentUser()?.role === 'admin') {
          this.isAdmin = true;
        } else {
          this.isAdmin = false;
          this.isUser = true;
        }
      } catch (error) {
      console.log(error);
    }
  }

  getUsersList() {
    this.userService.findAllUsers().subscribe(
      (data: User[]) => {
        this.users = data.filter(user => !user.isAdmin);
        this.filteredUsers = this.users;
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

  loadEvents(): void {
    this.eventSerice.getAllEvents().subscribe(
      (data: Event[]) => {
        this.events = data;
        this.calculateCategoryEventCounts();
      },
      (error) => {
        console.error('Error loading events', error);
      }
    );
  }

  updateCategory(id: number): void {
    this.categoryService.updateCategory(id, this.selectedCategory).subscribe(
      () => {
        this.loadCategories();
        this.loadEvents();
        this.calculateCategoryEventCounts();
        this.selectedCategory = { id: 0, title: '', description: '', parentId: 0};
      },
      (error) => {
        console.error('Error updating category', error);
      }
    );
  }

  deleteCategory(id: number): void {
    if(this.categoryEventCounts[id] > 0) {
      alert('Нельзя удалить категорию, к которой привязаны события');
      return;
    }
    this.categoryService.removeCategory(id).subscribe(
      () => {
        this.loadCategories();
        this.selectedCategory = { id: 0, title: '', description: '', parentId: 0};
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
          this.loadEvents();
          this.calculateCategoryEventCounts();
        },
        (error) => {
          console.error('Error creating category', error);
        }
      );
    }
  }

  calculateCategoryEventCounts(): void {
    this.categoryEventCounts = {};
    this.categories.forEach((category) => {
      const eventsForCategory = this.events.filter((event) => event.categoryId === category.id);
      this.categoryEventCounts[category.id] = eventsForCategory.length;
      console.log(this.categoryEventCounts);
    });
  }
  

  startEditing(category: Category): void {
    this.selectedCategory = { ...category };
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.selectedCategory = { id: 0, title: '', description: '', parentId: 0};
    this.isEditing = false;
  }

  deleteUser(id: number) {
    this.userService.removeUser(id).subscribe(() => {
      this.getUsersList();
    });
  }

  applyFilter(filterValue: number) {
    const filter = filterValue.toString().toLowerCase();
    this.filteredUsers = this.users.filter(user => user.id.toString().toLowerCase().includes(filter));
  } 
}
