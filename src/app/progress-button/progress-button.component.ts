import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'progress-button',
  inputs: ['label', 'msgSuccess', 'msgError'],
  templateUrl: './progress-button.component.html',
  styleUrls: ['./progress-button.component.scss']
})
export class ProgressButtonComponent implements OnInit {
  isLoading: boolean;
  message: string;
  label: string;
  msgSuccess: string;
  msgError: string;

  constructor() {
    this.isLoading = false;
  }

  ngOnInit() {
    this.message = this.label;
  }

  onClick() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.message = this.msgSuccess;
      setTimeout(() => {
        this.message = this.label;
      }, 2000);
    }, 2000);
  }
}
