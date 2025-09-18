import { Injectable } from '@angular/core';

export interface FormTemplate {
  id: string;
  formName: string;
  fields: any[];
}

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private templates: FormTemplate[] = [];

  add(template: FormTemplate): void {
    this.templates.push(template);
  }

  update(id: string, updated: FormTemplate): void {
    const index = this.templates.findIndex(t => t.id === id);
    if (index > -1) {
      this.templates[index] = updated;
    }
  }

  delete(id: string): void {
    this.templates = this.templates.filter(t => t.id !== id);
  }

  getById(id: string): FormTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  getAll(): FormTemplate[] {
    return [...this.templates]; 
  }
}

