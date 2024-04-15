import { Component, OnInit } from "@angular/core";
import { UserService } from "../services/user.service";
import { User } from "../dto/user.dto";
import { CategoryService } from "../services/category.service";
import { Category } from "../dto/category.dto";
import { Event } from "../dto/event.dto";
import { EventService } from "../services/event.service";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { RateUser } from "../dto/rate-user.dto";
import { Format } from "../dto/format.dto";
import { Country } from "../dto/country.dto";
import { City } from "../dto/city.dto";
import { LocationService } from "../services/location.service";

type NewType = OnInit;

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements NewType {
  users!: User[];
  moderators!: User[];
  events!: Event[];
  rates!: RateUser[];
  categories!: Category[];
  subcategories!: Category[];
  formats!: Format[];
  countries!: Country[];
  selectedCategory: Category = { id: 0, title: '', description: '', parentId: 0 };
  selectedFormat: Format = { id: 0, title: '', description: '' };
  selectedCountry: Country = { id: 0, countryName: '' };
  selectedCity: City = { id: 0, cityName: '', countryId: 0 };
  newCity: City = { id: 0, cityName: '', countryId: 0 };
  isEditing = true;
  isCreating = false;
  isCreatingFormat = false;
  ratingCount: { [userId: number]: number } = {};
  ratingCountTotal: { [userId: number]: number } = {};
  editingCategory: { [categoryId: number]: boolean } = {};
  editingFormat: { [formatId: number]: boolean } = {};
  editingCountry: { [countryId: number]: boolean } = {};
  editingCity: { [cityId: number]: boolean } = {};
  creatingCity: { [cityId: number]: boolean } = {};
  categoryEventCounts: { [categoryId: number]: number } = {};
  formatEventCounts: { [formatId: number]: number } = {};
  parentCategory: { [categoryId: number]: Category } = {};
  cities: { [countryId: number]: City[] } = {};
  filteredUsers: User[] = [];
  searchValue: number = 0;
  mainCategories: Category[] = [];
  isAdmin: boolean = false;
  isUser: boolean = false;

  errorMessage!: string;
  successMessage!: string;
  isErrorMessage = false;
  isSuccessMessage = false;

  isOpenUsers = true;
  isOpenModerators = false;
  isOpenCategories = false;
  isOpenFormats = false;
  isCreatingLocation = false;
  isOpenLocations = false;

  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private eventSerice: EventService,
    private authService: AuthService,
    private locationService: LocationService,
    private router: Router) { }

  ngOnInit(): void {
    this.checkCredentials();
    this.getUsersList();
    this.loadCategories();
    this.loadFormats();
    this.loadEvents();
    this.loadCountries();
    this.loadCities();
    this.showParentCategory();
    // this.showCities();
    this.loadRating();
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
        this.users = data.filter(user => user.role === 'user');
        this.moderators = data.filter(user => user.role === 'moderator')
        this.filteredUsers = this.users;
      },
      (error) => {
        console.error('Error loading users', error);
      }
    );
  }

  loadRatings() {
    this.userService.findAllUserRates().subscribe(
      (data: RateUser[]) => {
        this.rates = data;
      },
      (error) => {
        console.error('Error loading rating', error);
      }
    );
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

  loadCountries(): void {
    this.locationService.getAllCountries().subscribe(
      (data) => {
        this.countries = data;
      },
      (error) => {
        console.error('Error loading countries', error);
      }
    );
  }

  loadCities(): void {
    this.selectedCity={ id: 0, cityName: '', countryId: 0}
    this.locationService.getAllCountries().subscribe(
      (data) => {
        this.countries = data;
        for (let i = 0; i < this.countries.length; i++) {
          this.locationService.getCitiesByCountry(this.countries[i].id).subscribe(
            (cities) => {
              this.cities[this.countries[i].id] = cities;
            },
            (error) => {
              console.error('Error loading cities', error);
            }
          );
        }
      },
      (error) => {
        console.error('Error loading countries', error);
      }
    );
  }

  updateData(data: any, updateFunction: any, successMessage: string, errorMessage: string): void {
    updateFunction.subscribe(
      () => {
        this.loadFormats();
        this.loadCategories();
        this.loadEvents();
        this.loadCountries();
        this.loadCities();
        this.showMainCategories();
        this.calculateCategoryEventCounts();
        this.thisCategoryIsEditing(data.id);
        this.thisFormatIsEditing(data.id);
        
        this.creatingCity[data.id] = false;
        data.isEditing(data.id);
        data = { id: 0, title: '', description: '', parentId: 0 };
        this.isSuccessMessage = true;
        this.isErrorMessage = false;
        this.successMessage = successMessage;
      },
      (error: any) => {
        console.error('Error updating data', error);
        this.isErrorMessage = true;
        this.isSuccessMessage = false;
        this.errorMessage = errorMessage;
      }
    );
  }
  
  updateFormat(format: Format): void {
    this.selectedFormat = { ...format };
    this.updateData(
      this.selectedFormat,
      this.categoryService.updateFormat(format.id, this.selectedFormat),
      'Format has been successfully updated',
      'Error updating format'
    );
  }
  
  updateCategory(category: Category): void {
    this.selectedCategory = { ...category };
    this.updateData(
      this.selectedCategory,
      this.categoryService.updateCategory(category.id, category.parentId, this.selectedCategory),
      'Category has been successfully updated',
      'Error updating category'
    );
  }

  updateCountry(country: Country): void {
    this.selectedCountry = { ...country };
    this.updateData(
      this.selectedCountry,
      this.locationService.updateCountry(country.id, this.selectedCountry),
      'Country has been successfully updated',
      'Error updating country'
    );
  }

  updateCity(city: City): void {
    this.selectedCity = { ...city };
    this.updateData(
      this.selectedCity,
      this.locationService.updateCity(city.id, this.selectedCity),
      'City has been successfully updated',
      'Error updating city'
    );
  }

  deleteData(id: number, deleteFunction: any, successMessage: string, errorMessage: string): void {
    deleteFunction.subscribe(
      () => {
        this.loadFormats();
        this.loadCategories();
        this.loadEvents();
        this.loadCities();
        this.loadCountries();
        this.calculateCategoryEventCounts();
        this.isSuccessMessage = true;
        this.isErrorMessage = false;
        this.successMessage = successMessage;
      },
      (error: any) => {
        console.error('Error deleting data', error);
        this.isErrorMessage = true;
        this.isSuccessMessage = false;
        this.errorMessage = errorMessage;
      }
    );
  }

  deleteFormat(id: number): void {
    this.deleteData(
      id,
      this.categoryService.removeFormat(id),
      'Format has been successfully deleted',
      'Error deleting format'
    );
  }

  deleteCategory(id: number): void {
    this.deleteData(
      id,
      this.categoryService.removeCategory(id),
      'Category has been successfully deleted',
      'Error deleting category'
    );
  }

  deleteCountry(id: number): void {
    this.deleteData(
      id,
      this.locationService.deleteCountry(id),
      'Country has been successfully deleted',
      'Error deleting country'
    );
  }

  deleteCity(id: number): void {
    this.deleteData(
      id,
      this.locationService.deleteCity(id),
      'City has been successfully deleted',
      'Error deleting city'
    );
  }

  createData(data: any, createFunction: any, successMessage: string, errorMessage: string): void {
    createFunction.subscribe(
      () => {
        this.loadFormats();
        this.loadCategories();
        this.loadEvents();
        this.loadCountries();
        this.loadCities();
        this.calculateCategoryEventCounts();
        this.isSuccessMessage = true;
        this.isErrorMessage = false;
        this.successMessage = successMessage;
      },
      (error: any) => {
        console.error('Error creating data', error);
        this.isErrorMessage = true;
        this.isSuccessMessage = false;
        this.errorMessage = errorMessage;
      }
    );
  }

  createFormat(): void {
    this.createData(
      this.selectedFormat,
      this.categoryService.createFormat(this.selectedFormat),
      'Format has been successfully created',
      'Error creating format'
    );
  }

  createCategory(): void {
    this.createData(
      this.selectedCategory,
      this.categoryService.createCategory(this.selectedCategory.parentId, this.selectedCategory),
      'Category has been successfully created',
      'Error creating category'
    );
  }

  createCountry(): void {
    this.createData(
      this.selectedCountry,
      this.locationService.createCountry(this.selectedCountry),
      'Country has been successfully created',
      'Error creating country'
    );
  }

  createCity(countryId: number): void {
    this.createData(
      this.selectedCity,
      this.locationService.createCity(countryId, this.newCity),
      'City has been successfully created',
      'Error creating city'
    );
  }

  cancelCreating(): void {
    this.selectedCategory = { id: 0, title: '', description: '', parentId: 0 };
    this.selectedFormat = { id: 0, title: '', description: '' };
    this.selectedCountry = { id: 0, countryName: '' };
    this.thisCategoryIsEditing(this.selectedCategory.id);
    this.thisFormatIsEditing(this.selectedFormat.id);
    this.thisCountryIsEditing(this.selectedCountry.id);
  }

  calculateCategoryEventCounts(): void {
    this.categoryEventCounts = {};
    this.formatEventCounts = {};
    this.categories.forEach((category) => {
      const eventsForCategory = this.events.filter((event) => event.categoryId === category.id);
      this.categoryEventCounts[category.id] = eventsForCategory.length;
    });

    this.formats.forEach((format) => {
      const eventsForFormat = this.events.filter((event) => event.formatId === format.id);
      this.formatEventCounts[format.id] = eventsForFormat.length;
    });
  }

  loadRating(): void {
    this.userService.findAllUserRates().subscribe(
      (data: RateUser[]) => {
        this.rates = data;
        this.calculateRating();
      },
      (error) => {
        console.error('Error loading rating', error);
      }
    );
  }

  calculateRating(): void {
      this.ratingCount = {};
      this.ratingCountTotal = {};
      
      this.rates.forEach((rate) => {
          if (this.ratingCount[rate.ratedId]) {
              this.ratingCount[rate.ratedId] += rate.rate;
              this.ratingCountTotal[rate.ratedId] += 1;
              console.log("1", this.ratingCount[rate.ratedId]);
              
          } else {
              this.ratingCount[rate.ratedId] = rate.rate;
              this.ratingCountTotal[rate.ratedId] = 1;
              console.log("2", this.ratingCount[rate.ratedId]);
          }
      });
  
      for (const userId in this.ratingCount) {
          if (Object.prototype.hasOwnProperty.call(this.ratingCount, userId)) {
              this.ratingCount[userId] /= this.ratingCountTotal[userId];
          }
      }      
      console.log("3", this.ratingCount);
      
  }

  thisCategoryIsEditing(id: number): void {
    this.editingCategory[id] = !this.editingCategory[id];
  }

  thisFormatIsEditing(id: number): void {
    this.editingFormat[id] = !this.editingFormat[id];
  }

  thisCountryIsEditing(id: number): void {
    this.editingCountry[id] = !this.editingCountry[id];
    this.creatingCity[id] = false;
  }

  thisCityIsEditing(id: number): void {
    this.editingCity[id] = !this.editingCity[id];
  }

  thisCityIsCreating(id: number): void {
    this.creatingCity[id] = !this.creatingCity[id];
    this.editingCountry[id] = false;
  }

  showParentCategory(): void {
    this.categoryService.findAllCategories().subscribe(
      (data) => {
        for (let i = 0; i < data.length; i++) {
          for (let j = 0; j < data.length; j++) {
            if (data[i].parentId === data[j].id) {
              this.parentCategory[data[i].id] = data[j];
            }
          }
        }
      },
      (error) => {
        console.error('Error loading categories', error);
      }
    );
  }

  showMainCategories() {
    this.mainCategories = [];
    this.categoryService.findAllCategories().subscribe(
      (data) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].parentId === null && this.selectedCategory.id !== data[i].id) {
            this.mainCategories.push(data[i]);
          }
        }
      },
      (error) => {
        console.error('Error loading categories', error);
      }
    );
  }

  // showCities() {
  //   this.cities = {};
  //   this.locationService.getAllCountries().subscribe(
  //     (data) => {
  //       this.countries = data;
  //       for (let i = 0; i < this.countries.length; i++) {
  //         this.locationService.getCitiesByCountry(this.countries[i].id).subscribe(
  //           (cities) => {
  //             this.cities[this.countries[i].id] = cities;
  //           },
  //           (error) => {
  //             console.error('Error loading cities', error);
  //           }
  //         );
  //       }
  //     },
  //     (error) => {
  //       console.error('Error loading countries', error);
  //     }
  //   );
  // }

  selectCity(city: City): void {
    this.selectedCity = city;
  }

  startEditing(category: Category): void {
    this.selectedCategory = { ...category };
    this.thisCategoryIsEditing(category.id);
  }

  startEditingFormat(format: Format): void {
    this.selectedFormat = { ...format };
    this.thisFormatIsEditing(format.id);
  }

  startEditingCountry(country: Country): void {
    this.selectedCountry = { ...country };
    this.thisCountryIsEditing(country.id);
  }

  startEditingCity(city: City): void {
    this.selectedCity = { ...city };
    this.thisCityIsEditing(city.id);
  }

  startCreatingCity(country: Country): void {
    this.selectedCountry = { ...country };
    this.thisCityIsCreating(country.id);
  }

  cancelEditingFormat(format: Format): void {
    this.selectedFormat = { id: 0, title: '', description: '' };
    this.thisFormatIsEditing(format.id);
    this.loadFormats();
  }

  cancelEditing(category: Category): void {
    this.selectedCategory = { id: 0, title: '', description: '', parentId: 0 };
    this.thisCategoryIsEditing(category.id);
    this.loadCategories();
  }

  cancelEditingCountry(country: Country): void {
    this.selectedCountry = { id: 0, countryName: '' };
    this.thisCountryIsEditing(country.id);
    this.loadCountries();
  }

  cancelEditingCity(city: City): void {
    this.selectedCity = { id: 0, cityName: '', countryId: 0 };
    this.thisCityIsEditing(city.id);
    this.loadCities();
  }

  deleteUser(id: number) {
    this.userService.removeUser(id).subscribe(() => {
      this.getUsersList();
      this.successMessage = 'User has been successfully deleted';
      this.isSuccessMessage = true;
      this.isErrorMessage = false;
    });
  }

  applyFilter(filterValue: number) {
    const filter = filterValue.toString().toLowerCase();
    this.filteredUsers = this.users.filter(user => user.id.toString().toLowerCase().includes(filter));
  }

  openList(list: string) {
    const isOpenValues: Record<string, { isOpenUsers?: boolean; isOpenModerators?: boolean;
       isOpenCategories?: boolean; isCreating?: boolean; isOpenFormats?: boolean;
        isCreatingFormat?: boolean; isOpenLocations?: boolean; isCreatingLocation?: boolean;}> = {
      'users': { isOpenUsers: true },
      'moderators': { isOpenModerators: true },
      'categories': { isOpenCategories: true },
      'createCategory': { isCreating: true },
      'formats': { isOpenFormats: true },
      'createFormat': { isCreatingFormat: true },
      'locations': { isOpenLocations: true },
      'createLocation': { isCreatingLocation: true}
    };

    this.isOpenUsers = false;
    this.isOpenModerators = false;
    this.isOpenCategories = false;
    this.isOpenFormats = false;
    this.isCreating = false;
    this.isCreatingFormat = false;
    this.isOpenFormats = false;
    this.isCreatingLocation = false;
    this.isOpenLocations = false;

    if (isOpenValues[list]) {
      Object.assign(this, isOpenValues[list]);
    }
  }

  addModerator(id: number) {
    this.userService.addModerator(id).subscribe(() => {
      this.getUsersList();
      this.successMessage = 'Moderator has been successfully added';
      this.isSuccessMessage = true;
      this.isErrorMessage = false;
    });
  }

  removeModerator(id: number) {
    this.userService.removeModerator(id).subscribe(() => {
      this.getUsersList();
      this.successMessage = 'Moderator has been successfully deleted';
      this.isSuccessMessage = true;
      this.isErrorMessage = false;
    });
  }

  closeMessage() {
    this.isErrorMessage = false;
    this.isSuccessMessage = false;
  }
}
