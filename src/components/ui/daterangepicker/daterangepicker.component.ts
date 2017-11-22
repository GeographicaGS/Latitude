import { Component, OnInit, OnChanges, ViewEncapsulation, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { IMyDrpOptions } from 'mydaterangepicker';
import * as moment from 'moment/moment';

@Component({
  selector: 'latitude-daterangepicker',
  templateUrl: './daterangepicker.component.html',
  styleUrls: ['./daterangepicker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DateRangePickerComponent implements OnInit, OnChanges {

  @ViewChild('startHour') startHour : any;
  @ViewChild('startMinutes') startMinutes: any;
  @ViewChild('endHour') endHour: any;
  @ViewChild('endMinutes') endMinutes: any;

  @Output() dateChange = new EventEmitter<any>();
  @Input() start: any;
  @Input() end: any;
  @Input() formatDate: string;
  @Input() time = false;
  @Input() disabled = false;

  public title: string;
  public show = false;
  public showTime = false;
  public myDatePickerOptions: IMyDrpOptions = {
      yearSelector: false,
      monthSelector: false,
      inline: true
  };

  public model: any;

  constructor() { }

  ngOnInit() {
    this._setModel();
    this._setTitle();
  }

  ngOnChanges(changes: any) {
    if (changes.start.previousValue !== false) {
      this.start = changes.start.currentValue;
    }
    if (changes.end.previousValue !== false) {
      this.end = changes.end.currentValue;
    }
    this._setModel();
    this._setTitle();
  }

  toggleSelector() {
    this.show = !this.show;
    if (this.show) {
      this._setModel();
    }else {
      this._setDateTime();
      this._emitDateChange();
    }
  }

  onDateRangeChanged(range: any) {
    this.start = moment(range.beginJsDate);
    this.end = moment(range.endJsDate);
    this._setDateTime();
    this._setTitle();
    this._emitDateChange();
    this.show = false;
  }

  switchTime(value: any) {
    this.showTime = value;
  }

  nextInput(e: any, el: any) {
    if (e.currentTarget.value.length === 2 && !isNaN(parseInt(e.key, 0))) {
      el.select();
    }
  }

  _setModel() {
    if (this.start && this.end) {
      const start = this.start.toDate();
      const end = this.end.toDate();
      this.model = {
                    beginDate: {
                      year: start.getFullYear(),
                      month: start.getMonth() + 1,
                      day: start.getDate()
                    },
                    endDate: {
                      year: end.getFullYear(),
                      month: end.getMonth() + 1,
                      day: end.getDate()
                    }
                   };
    }
  }

  _setTitle() {
    if (this.start && this.end) {
      this.title = `${this.start.format(this.formatDate)} - ${this.end.format(this.formatDate)}`;
    }
  }

  _setDateTime() {
    if (!this.showTime) {
      this.start.set({hour: 0, minute: 0, second: 0 , millisecond: 0});
      this.end.set({hour: 23, minute: 59, second: 59 , millisecond: 0});
    }else {
      this.start
      .set({hour: this.startHour.nativeElement.value, minute: this.startMinutes.nativeElement.value, second: 0 , millisecond: 0});
      this.end
      .set({hour: this.endHour.nativeElement.value, minute: this.endMinutes.nativeElement.value, second: 59 , millisecond: 0});
    }
  }

  _emitDateChange() {
    this.dateChange.emit({
      start: this.start,
      end: this.end
    });
  }
}
