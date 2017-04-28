import { Component, Input, Output, forwardRef, EventEmitter, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

const CHECKBOX_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ProgressButtonComponent),
  multi: true
}

@Component({
  selector: 'progress-button',
  templateUrl: './progress-button.component.html',
  styleUrls: ['./progress-button.component.scss']
})
export class ProgressButtonComponent implements OnInit {
  isLoading: boolean;
  message: string;

  @Input() label: string;
  @Input() msgSuccess: string;
  @Input() msgError: string;
  @Output() click = new EventEmitter();

  constructor() {
    this.isLoading = false;
  }

  ngOnInit() {
    this.message = this.label;
  }

  onClick() {
    // this.click.emit(); // Commented because double click event
    this.isLoading = true;
  }

  showSuccess() {
    this.isLoading = false;
    this.message = this.msgSuccess;
  }

  showError() {
    this.isLoading = false;
    this.message = this.msgError;
  }

  reset() {
    this.message = this.label;
  }
}
