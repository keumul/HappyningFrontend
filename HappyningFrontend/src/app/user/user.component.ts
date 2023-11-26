import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../dto/user.dto';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userId: any;
  currentUser!: User;

  constructor(private route: ActivatedRoute,
    private userService: UserService) { }


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = params['userId'];
    });
    this.userService.findUser(this.userId).subscribe((user) => {
      this.currentUser = user;
    });
  }

  calculateAge(birthdate: Date): number {
    const today = new Date();
    const birthdateDate = new Date(birthdate);
  
    let age = today.getFullYear() - birthdateDate.getFullYear();
    const monthDiff = today.getMonth() - birthdateDate.getMonth();
  
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateDate.getDate())) {
      age--;
    }
  
    return age;
  }
  
}
