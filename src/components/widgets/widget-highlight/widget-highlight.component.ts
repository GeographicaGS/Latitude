import { Component, OnInit, OnChanges, HostBinding, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


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
  @Input() tokens: number = 2;

  @HostBinding('class.loading') @Input() loading = false;

  data = [];
  @Input() number = 2;
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
      if (this.tokens === 2) {
        return this.text.replace('{0}', this.data[0].target).replace('{1}', this.data[0].label);
      } else {
        return this.text.replace('{0}', this.data[0].target);
      }
    } else {
      let text = this.text;
      for (let i = 0; i < this.tokens; i++) {
        if (this.data[i]) {
          text = text.replace(`{${i}}`, this.data[i].category);
        }
      }
      return text;
    }
  }

  private formatData(data) {
    if (this.doubleHistogram) {
      this.sortAndGetMax(data);
    } else {
      this.data = data.map(c => {
        const id = c.id ? c.id : c.category;
        const label = this.labels[id] ? this.labels[id] : c.label ? c.label : id;
        return {category_id: id, value: c.value, category: this.translate.instant(label)};
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
