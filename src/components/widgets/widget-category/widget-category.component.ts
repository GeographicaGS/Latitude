import { Component, Input, OnInit, OnChanges, HostBinding, EventEmitter, Output } from '@angular/core';
import { WidgetBaseComponent } from '../widget-base/widget-base.component';

@Component({
  selector: 'latitude-widget-category',
  templateUrl: './widget-category.component.html',
  styleUrls: ['./widget-category.component.scss']
})
export class WidgetCategoryComponent extends WidgetBaseComponent {

  disabledList = [];
  histogramData = [];

  @Input() colors: any = false;
  @Input() labels: any = false;
  @Input() title: string;
  @Input() barsDefaultColor = 'black';

  @HostBinding('class.filter') @Input() filter = true;

  @Output() disabledCategories = new EventEmitter<Array<string>>();

  toggleCategory(d) {
    if (!this.filter) { return; }
    if (this.disabledList.indexOf(d) < 0) {
      this.disabledList.push(d);
    }else {
      this.disabledList = this.disabledList.filter((elem) => elem !== d);
    }
    this.disabledCategories.emit(this.disabledList);
  }

  getBarStyle(d) {
    let bgColor = this.barsDefaultColor;
    if (this.colors[d.category_id]) {
      bgColor = this.colors[d.category_id];
    }
    return {'background-color': bgColor, 'width': (( d.value / this.getMax() ) * 100) + '%' };
  }

  fetch(opts) {
    this.data.dataSource.fetch('histogram', {
      agg: this.data.agg,
      bbox: opts.bbox
    }).then(data => this.render(data));
  }

  render(data) {
    this.histogramData = data.map((c) => { c.label = (this.labels[c.categery] ? this.labels[c.categery] : c.category ); return c; });
  }

  private getMax() {
    return Math.max.apply(Math, this.histogramData.map((d) => { return d.value; }));
  }
}
