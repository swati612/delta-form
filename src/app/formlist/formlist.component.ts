import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormService } from '../form.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formlist',
  imports: [CommonModule],
  templateUrl: './formlist.component.html',
  styleUrl: './formlist.component.scss'
})
export class FormlistComponent {

  templates: any[] = [];

  constructor(private router: Router, private service: FormService) {

  }

  ngOnInit() {
    
    this.templates = this.service.getAll();
    console.log('this.templates',this.templates)

    
  }

  newForm() {
    this.router.navigate(['/admin']);
  }

  preview(id: number) {


  }

  edit(id: string) {
    this.router.navigate(['/admin', id]);

  }

  deleteForm(id: string) {
    this.templates = this.templates.filter(t => t.id !== id);
    if(this.templates.length===0){
    }
  }
}
