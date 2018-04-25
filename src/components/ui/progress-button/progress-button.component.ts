import { Component, Input, Output, forwardRef, EventEmitter, OnInit } from '@angular/core';

export enum ProgressButtonState {
  LOADING,
  SUCCESS,
  ERROR
}

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

  get isLoading() {
    return this.state === ProgressButtonState.LOADING;
  }

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
    this.state = ProgressButtonState.LOADING;
    this.onClick.emit();
  }
}
