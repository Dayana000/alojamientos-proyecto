import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './form-input.html',
  styleUrls: ['./form-input.scss'],
})
export class FormInputComponent {
  @Input() label = '';
  @Input() type: string = 'text';
  @Input() placeholder = '';
  @Input() control!: FormControl;
  @Input() errorMessage: string | null = null;
}
