import { Component, ViewChild } from '@angular/core';
import { ProgressButtonComponent } from './progress-button/progress-button.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Latitude';
  private toogleValue = true;
  @ViewChild(ProgressButtonComponent)
  private progressButton: ProgressButtonComponent;


  onToggleChange($event) {
    console.log(`Toggle event value is ${$event.target.checked}`);
    console.log(`Toggle object value is ${this.toogleValue}`);
  }

  onProgressButtonClick() {
    setTimeout(() => {
      this.progressButton.showSuccess();
      console.log(`Show icing level is ${this.toogleValue}`);

      setTimeout(() => {
        this.progressButton.reset();
        this.toogleValue = false;
      }, 5000);
    }, 2000);
  }
}
