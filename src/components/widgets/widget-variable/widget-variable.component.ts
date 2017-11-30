import { Component, OnInit, HostBinding, Input, Output } from '@angular/core';

@Component({
  selector: 'latitude-widget-variable',
  templateUrl: './widget-variable.component.html',
  styleUrls: ['./widget-variable.component.scss']
})
export class WidgetVariableComponent implements OnInit {

  @Input() title: string;
  @Input() text: string;
  @Input() data: any;
  @Input() units: string;

  @HostBinding('class.loading') @Input() loading = false;

  loadingColor = 'blue'; // TODO: dynamic color

  constructor() {}

  ngOnInit() {}

  formatNumber(value) {
    return parseInt(value, 10).toLocaleString();
  }

}
