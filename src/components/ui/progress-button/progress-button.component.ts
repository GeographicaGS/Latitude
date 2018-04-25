import { Component, Input, Output, forwardRef, EventEmitter, OnInit } from '@angular/core';

export type ProgressButtonState = 'loading' | 'success' | 'error'; 

@Component({
  selector: 'latitude-progress-button',
  templateUrl: './progress-button.component.html',
  styleUrls: ['./progress-button.component.scss']
})
export class ProgressButtonComponent implements OnInit {

  @Input() state: ProgressButtonState = null;
  @Input() label: string;
  @Input() successLabel: string;
  @Input() errorLabel: string;
  @Output() onClick = new EventEmitter();

  get currentLabel() {
    if(!this.state) {
      return this.label;
    }
    const stateMap = {
      loading: '',
      error: this.errorLabel,
      success: this.successLabel
    }
    return stateMap[this.state];
  }

  handleClick() {
    this.state = 'loading';
    this.onClick.emit();
  }
}
