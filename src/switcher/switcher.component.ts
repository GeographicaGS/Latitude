import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'latitude-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.scss']
})
export class SwitcherComponent implements OnInit {

  @Input() width: String;
  @Input() height: String;
  @Input() checked: Boolean;
  @Output() enable = new EventEmitter<Boolean>();
  @Output() onChange = new EventEmitter<Boolean>();

  constructor() {}

  ngOnInit() {}

  change() {
    this.checked = !this.checked;
    this.onChange.emit(this.checked);
  }

}
