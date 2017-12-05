import { Component, Input, OnInit, OnChanges, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'latitude-widget-category',
  templateUrl: './widget-category.component.html',
  styleUrls: ['./widget-category.component.scss']
})
export class WidgetCategoryComponent implements OnInit, OnChanges {

  disabledList = [];
  data = [];

  @Input() dataSource: any;
  @Input() colors: any = false;
  @Input() labels: any = false;
  @Input() title: string;

  @Output() disabledCategories = new EventEmitter<Array<string>>();

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes) {
    if (changes.dataSource &&
      (
        (changes.dataSource.firstChange && changes.dataSource.currentValue !== undefined) || 
        (!changes.dataSource.firstChange && changes.dataSource.currentValue !== changes.dataSource.previousValue)
      )
    ) {
      this.dataSource.fetch().then((data) => this.formatData(data));
    }
  }

  toggleCategory(d) {
    if (this.disabledList.indexOf(d) < 0) {
      this.disabledList.push(d);
    }else {
      this.disabledList = this.disabledList.filter((elem) => elem !== d);
    }
    this.disabledCategories.emit(this.disabledList);
  }

  getBarStyle(d) {
    let bgColor = 'black';
    if (this.colors[d.category_id]) {
      bgColor = this.colors[d.category_id];
    }
    return {'background-color': bgColor, 'width': (( d.value/ this._getMax() ) * 100) + '%' };
  }

  formatValue(value) {
    return value && !isNaN(value) ? value.toFixed(2) : value;
  }

  private formatData(data) {
    this.data = data.map(c => {
      let id = c.category_id && !c.id ? c.category_id : c.id;
      const label = this.labels[id] ? this.labels[id] : c.label ? c.label : id;
      return {category_id: id, value: c.value, category: label};
    });
  }

  private _getMax() {
    return Math.max.apply(Math, this.data.map((d) => { return d.value }));
  }
}
