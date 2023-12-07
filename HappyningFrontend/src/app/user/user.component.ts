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

  displayAge() {
    var age = this.calculateAge(this.currentUser.bday);

    var yearsText = ( age % 10 === 1 && age % 100 !== 11) ? "год" : (age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 10 || age % 100 >= 20)) ? "года" : "лет";

    return age + " " + yearsText;
}
  
}
