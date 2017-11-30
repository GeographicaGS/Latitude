import { Component, OnInit, OnChanges, HostBinding, Input, Output } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';


@Component({
  selector: 'latitude-widget-highlight',
  templateUrl: './widget-highlight.component.html',
  styleUrls: ['./widget-highlight.component.scss']
})
export class WidgetHighlightComponent implements OnInit, OnChanges {

  @Input() title: string;
  @Input() dataSource: any;
  @Input() labels: any = false;
  @Input() text: string;
  @Input() doubleHistogram = false;
  @Input() tokens: any;

  @HostBinding('class.loading') @Input() loading = false;

  data = [];
  number = 2;
  loadingColor = 'blue'; // TODO: dynamic color
  ranges = [];
  status = [];

  constructor(private translate: TranslateService) {}

  ngOnInit() {}

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

  getFormattedText() {
    this.text = this.translate.instant(this.text);
    if (this.doubleHistogram) {
      return this.text.replace('{0}', this.data[0].target).replace('{1}', this.data[0].label)
    } else {
      return this.text.replace('{0}', this.data[0].category).replace('{1}', this.data[1].category)
    }
  }

  private formatData(data) {
    if (this.doubleHistogram) {
      this.sortAndGetMax(data);
    } else {
      this.data = data.map(c => {
        const label = this.labels[c.id] ? this.labels[c.id] : c.label ? c.label : c.id;
        return {category_id: c.id, value: c.value, category: this.translate.instant(label)};
      }).sort((a, b) => {
        return a.value + b.value;
      }).splice(0, this.number);
    }
  }

  private sortAndGetMax(formattedData) {
    this.data = formattedData.map((c) => {
      let objectKeys = Object.keys(c);
      let maxVal = 0;
      let maxKey = '';
      for (let k of objectKeys) {
        if (k === 'Label') {
          continue;
        }
        if (c[k] > maxVal) {
          maxVal = c[k];
          maxKey = k;
        }
      }
      const targetLabel = this.labels[maxKey] ? this.labels[maxKey] : maxKey;
      return {label: this.translate.instant(c.Label), target: this.translate.instant(targetLabel), value: maxVal};
    });

    this.data = this.data.sort((a, b) => {
      return a.value + b.value;
    });
  }
}
