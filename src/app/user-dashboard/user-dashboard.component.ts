import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  imports: [],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {
  constructor(private router: Router) {

  }

  newForm(){
    const existingSavedForms = JSON.parse(localStorage.getItem('savedForms') || '[]');
    
    this.router.navigate(['/admin']);

  }
}
