import { Component, Input, OnInit, OnChanges, HostBinding, EventEmitter, Output } from '@angular/core';
import { WidgetBaseComponent } from '../widget-base/widget-base.component';

@Component({
  selector: 'latitude-widget-category',
  templateUrl: './widget-category.component.html',
  styleUrls: ['./widget-category.component.scss']
})
export class WidgetCategoryComponent extends WidgetBaseComponent {

  disabledList = [];

  private _data = [];

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
    return {'background-color': bgColor, 'width': (( d.value/ this._getMax() ) * 100) + '%' };
  }

  fetch(opts) {
    this.data.dataSource.fetch('histogram', {
      agg: this.data.agg,
      property: this.data.property,
      bbox: opts.bbox
    }).then(data => this.render(data));
  }

  render(data) {
    this._data = data.map(c => {
      let id = c.category_id && !c.id ? c.category_id : c.id;
      const label = this.labels[id] ? this.labels[id] : c.label ? c.label : id;
      return {category_id: id, value: c.value, category: label};
    });
  }

  private _getMax() {
    return Math.max.apply(Math, this._data.map((d) => { return d.value }));
  }
}
