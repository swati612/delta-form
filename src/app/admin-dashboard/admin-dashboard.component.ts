// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { FormService } from '../form.service';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule
  ]
})
export class AdminDashboardComponent implements OnInit {
  formBuilderForm!: FormGroup;
  fieldTypes = ['text', 'textarea', 'select', 'checkbox', 'radio'];
  isEditMode = false;
  editId!: string;

  constructor(private fb: FormBuilder,private router: Router , private service: FormService) {}

  ngOnInit(): void {

    
    this.initializeForm();
  }

  initializeForm(): void {
    this.formBuilderForm = this.fb.group({
      formName: ['', Validators.required],
      fields: this.fb.array([])
    });
  }

  get fieldsArray(): FormArray {
    return this.formBuilderForm.get('fields') as FormArray;
  }

  get formName(): string {
    return this.formBuilderForm.get('formName')?.value || '';
  }

  drop(event: CdkDragDrop<any>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.fieldsArray.controls, event.previousIndex, event.currentIndex);
      moveItemInArray(this.fieldsArray.value, event.previousIndex, event.currentIndex);
    } else {
      const fieldType = event.previousContainer.data[event.previousIndex];
      this.addField(fieldType);
    }
  }

  addField(type: string): void {
    const fieldGroup = this.fb.group({
      id: [this.generateObjectId()],
      type: [type],
      label: [`${type.charAt(0).toUpperCase() + type.slice(1)} Field`, Validators.required],
      helpText: [''],
      required: [false],
      options: this.fb.array(this.hasOptions(type) ? [this.fb.control('Option 1')] : []),
      minLength: [null],
      maxLength: [null],
      pattern: ['']
    });

    this.fieldsArray.push(fieldGroup);
  }

  getFieldFormGroup(index: number): FormGroup {
    return this.fieldsArray.at(index) as FormGroup;
  }

  getOptionsArray(fieldIndex: number): FormArray {
    const fieldGroup = this.getFieldFormGroup(fieldIndex);
    return fieldGroup.get('options') as FormArray;
  }

  addOption(fieldIndex: number): void {
    const optionsArray = this.getOptionsArray(fieldIndex);
    const optionCount = optionsArray.length + 1;
    optionsArray.push(this.fb.control(`Option ${optionCount}`));
  }

  removeOption(fieldIndex: number, optionIndex: number): void {
    const optionsArray = this.getOptionsArray(fieldIndex);
    if (optionsArray.length > 1) {
      optionsArray.removeAt(optionIndex);
    }
  }

  removeField(index: number): void {
    this.fieldsArray.removeAt(index);
  }

  hasOptions(fieldType: string): boolean {
    return ['select', 'checkbox', 'radio'].includes(fieldType);
  }

  hasTextValidation(fieldType: string): boolean {
    return ['text', 'textarea'].includes(fieldType);
  }

  save(): void {
    if (this.formBuilderForm.valid) {
      const formData = this.formBuilderForm.value;
      console.log('Form Data:', formData);
      
      const cleanedFields = formData.fields.map((field: any) => {
        const cleanedField: any = {
          id: field.id,
          type: field.type,
          label: field.label,
          required: field.required
        };

        if (field.helpText) {
          cleanedField.helpText = field.helpText;
        }

        if (this.hasOptions(field.type)) {
          cleanedField.options = field.options.filter((option: string) => option.trim());
        }

        if (this.hasTextValidation(field.type)) {
          if (field.minLength) cleanedField.minLength = field.minLength;
          if (field.maxLength) cleanedField.maxLength = field.maxLength;
          if (field.pattern) cleanedField.pattern = field.pattern;
        }

        return cleanedField;
      });

      const finalFormData = {
        id: this.generateObjectId(),
        formName: formData.formName,
        fields: cleanedFields
      };

      console.log(' Form data:', finalFormData);
      
 
      if (this.isEditMode) {
        this.service.update(this.editId, finalFormData);
      } else {
        this.service.add(finalFormData);
      }



      localStorage.setItem('savedForms', JSON.stringify(finalFormData));
      this.router.navigate(['/form-list']);

      
    } 
  }



  generateObjectId(): string {
    const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
    let objectId = timestamp;

    while (objectId.length < 24) {
      objectId += Math.floor(Math.random() * 16).toString(16);
    }
    return objectId;
  }




  onFieldTypeChange(fieldIndex: number, newType: string): void {
    const fieldGroup = this.getFieldFormGroup(fieldIndex);
    fieldGroup.patchValue({ type: newType });
    
    const optionsArray = this.getOptionsArray(fieldIndex);
    optionsArray.clear();
    
    if (this.hasOptions(newType)) {
      optionsArray.push(this.fb.control('Option 1'));
    }
    
    if (!this.hasTextValidation(newType)) {
      fieldGroup.patchValue({
        minLength: null,
        maxLength: null,
        pattern: ''
      });
    }
  }



  isFieldValid(fieldIndex: number, fieldName: string): boolean {
    const fieldGroup = this.getFieldFormGroup(fieldIndex);
    const control = fieldGroup.get(fieldName);
    return control ? control.valid : true;
  }

  getFieldError(fieldIndex: number, fieldName: string): string | null {
    const fieldGroup = this.getFieldFormGroup(fieldIndex);
    const control = fieldGroup.get(fieldName);
    
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${fieldName} is required`;
      }
    }
    
    return null;
  }


  resetForm(): void {
    if (confirm('Are you sure you want to reset the form? All changes will be lost.')) {
      this.initializeForm();
    }
  }
}