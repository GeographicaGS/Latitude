import { Component, OnInit, HostBinding, Input, Output } from '@angular/core';
import { WidgetBaseComponent } from '../widget-base/widget-base.component';

@Component({
  selector: 'latitude-widget-variable',
  templateUrl: './widget-variable.component.html',
  styleUrls: ['./widget-variable.component.scss']
})
export class WidgetVariableComponent extends WidgetBaseComponent {

  private variableData = '--';
  @Input() title: string;
  @Input() text: string;
  @Input() units: string;

  @HostBinding('class.loading') @Input() loading = false;

  loadingColor = 'blue'; // TODO: dynamic color


  fetch(opts) {
    this.data.dataSource.fetch('variable', {
      agg: this.data.agg,
      bbox: opts.bbox
    }).then(data => this.render(data));
  }

  render(data) {
    this.variableData = data.value;
  }


}
