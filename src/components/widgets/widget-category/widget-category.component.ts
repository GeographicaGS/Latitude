import { Component, Input, OnInit, OnChanges, HostBinding, EventEmitter, Output } from '@angular/core';
import { WidgetBaseComponent } from '../widget-base/widget-base.component';

@Component({
  selector: 'latitude-widget-category',
  template: `<div class="widgetTitle" *ngIf="title">{{title}}</div><div class="selectedInfo"><ng-container *ngIf="disabledList.length === 0">{{ 'ALL Selected' | translate }}</ng-container><ng-container *ngIf="disabledList.length !== 0">{{ data.length - disabledList.length }} {{ 'Selected' | translate }}</ng-container></div><ng-container *ngIf="data && data.length > 0"><div class="categoryWrapper" *ngFor="let d of data" (click)="toggleCategory(d.category_id)" [class.active]="disabledList.indexOf(d.category_id) < 0"><div class="label"><span>{{ d.category | translate }}</span> <span>{{ formatValue(d.value) }}</span></div><div class="bar"><div><div [ngStyle]="getBarStyle(d)" class="progress"></div></div></div></div></ng-container>`,
  styles: [`@-webkit-keyframes tranlateInAnimation{0%{opacity:0;visibility:hidden;-webkit-transform:translateY(-100%);transform:translateY(-100%)}1%{visibility:visible}to{opacity:1;visibility:visible;-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes tranlateInAnimation{0%{opacity:0;visibility:hidden;-webkit-transform:translateY(-100%);transform:translateY(-100%)}1%{visibility:visible}to{opacity:1;visibility:visible;-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes slideLeftOutAnimation{0%{opacity:inherit;visibility:inherit;-webkit-transform:translateX(0);transform:translateX(0)}99%{visibility:inherit;-webkit-transform:translateX(0);transform:translateX(0)}to{opacity:0;visibility:hidden;-webkit-transform:translateX(-100%);transform:translateX(-100%)}}@keyframes slideLeftOutAnimation{0%{opacity:inherit;visibility:inherit;-webkit-transform:translateX(0);transform:translateX(0)}99%{visibility:inherit;-webkit-transform:translateX(0);transform:translateX(0)}to{opacity:0;visibility:hidden;-webkit-transform:translateX(-100%);transform:translateX(-100%)}}@-webkit-keyframes slideLeftInAnimation{0%{opacity:0;visibility:hidden;-webkit-transform:translateX(100%);transform:translateX(100%)}1%{visibility:visible}to{opacity:1;visibility:visible;-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes slideLeftInAnimation{0%{opacity:0;visibility:hidden;-webkit-transform:translateX(100%);transform:translateX(100%)}1%{visibility:visible}to{opacity:1;visibility:visible;-webkit-transform:translateX(0);transform:translateX(0)}}@-webkit-keyframes dropdownInAnimation{0%{opacity:0;visibility:hidden;-webkit-transform:translateY(-18px);transform:translateY(-18px)}1%{visibility:visible}to{opacity:1;visibility:visible;-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes dropdownInAnimation{0%{opacity:0;visibility:hidden;-webkit-transform:translateY(-18px);transform:translateY(-18px)}1%{visibility:visible}to{opacity:1;visibility:visible;-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes dropdownOutAnimation{0%{opacity:inherit;visibility:inherit;-webkit-transform:translateY(0);transform:translateY(0)}99%{visibility:inherit;-webkit-transform:translateY(0);transform:translateY(0)}to{opacity:0;visibility:hidden;-webkit-transform:translateY(-18px);transform:translateY(-18px)}}@keyframes dropdownOutAnimation{0%{opacity:inherit;visibility:inherit;-webkit-transform:translateY(0);transform:translateY(0)}99%{visibility:inherit;-webkit-transform:translateY(0);transform:translateY(0)}to{opacity:0;visibility:hidden;-webkit-transform:translateY(-18px);transform:translateY(-18px)}}@-webkit-keyframes tooltipInAnimation{0%{opacity:0;visibility:hidden;-webkit-transform:translate(-50%,-8px);transform:translate(-50%,-8px)}1%{visibility:visible}to{opacity:1;visibility:visible;-webkit-transform:translate(-50%,0);transform:translate(-50%,0)}}@keyframes tooltipInAnimation{0%{opacity:0;visibility:hidden;-webkit-transform:translate(-50%,-8px);transform:translate(-50%,-8px)}1%{visibility:visible}to{opacity:1;visibility:visible;-webkit-transform:translate(-50%,0);transform:translate(-50%,0)}}@-webkit-keyframes tooltipOutAnimation{0%{opacity:inherit;visibility:inherit;-webkit-transform:translate(-50%,0);transform:translate(-50%,0)}99%{visibility:inherit;-webkit-transform:translate(-50%,0);transform:translate(-50%,0)}to{opacity:0;visibility:hidden;-webkit-transform:translate(-50%,-8px);transform:translate(-50%,-8px)}}@keyframes tooltipOutAnimation{0%{opacity:inherit;visibility:inherit;-webkit-transform:translate(-50%,0);transform:translate(-50%,0)}99%{visibility:inherit;-webkit-transform:translate(-50%,0);transform:translate(-50%,0)}to{opacity:0;visibility:hidden;-webkit-transform:translate(-50%,-8px);transform:translate(-50%,-8px)}}@-webkit-keyframes fadeInAnimation{0%{opacity:0;visibility:hidden}1%{visibility:visible}to{opacity:1;visibility:visible}}@keyframes fadeInAnimation{0%{opacity:0;visibility:hidden}1%{visibility:visible}to{opacity:1;visibility:visible}}@-webkit-keyframes fadeOutAnimation{0%{opacity:inherit;visibility:inherit}99%{visibility:inherit}to{opacity:0;visibility:hidden}}@keyframes fadeOutAnimation{0%{opacity:inherit;visibility:inherit}99%{visibility:inherit}to{opacity:0;visibility:hidden}}:host{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-flex:1;-ms-flex:1 1 100%;flex:1 1 100%;padding:var(--widget-category-padding, 0)}:host .widgetTitle{font-weight:700;font-size:14px;line-height:18px;color:#383d4c}:host .selectedInfo{font-size:14px;line-height:16px;margin-top:6px;margin-bottom:26px}:host.filter .categoryWrapper{cursor:pointer}:host:not(.filter) .categoryWrapper{cursor:default}:host .categoryWrapper:not(.active) .label span{color:#c9cbd1}:host .categoryWrapper:not(.active) .bar>div .progress{background-color:#c9cbd1!important}:host .categoryWrapper+div{margin-top:14px}:host .categoryWrapper .label{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between}:host .categoryWrapper .label span{font-size:14px;line-height:14px;-webkit-transition:color linear .5s;transition:color linear .5s}:host .categoryWrapper .bar>div{height:6px;border-radius:2px;background-color:#f2f2f4;margin-top:8px;position:relative}:host .categoryWrapper .bar>div .progress{border-radius:2px;position:absolute;top:0;left:0;height:100%;-webkit-transition:background-color linear .5s;transition:background-color linear .5s}`]
})
export class WidgetCategoryComponent extends WidgetBaseComponent implements OnChanges {

  disabledList = [];
  data = [];

  @Input() dataSource: any;
  @Input() colors: any = false;
  @Input() labels: any = false;
  @Input() title: string;
  @Input() barsDefaultColor = 'black';

  @HostBinding('class.filter') @Input() filter = true;

  @Output() disabledCategories = new EventEmitter<Array<string>>();

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
