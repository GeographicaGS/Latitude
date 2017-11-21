import { Component, OnInit, HostBinding, Input, OnChanges, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'latitude-selectfilter',
  templateUrl: './selectfilter.component.html',
  styleUrls: ['./selectfilter.component.scss']
})
export class SelectfilterComponent implements OnInit, OnChanges {
  @HostBinding('class.open') showFilter = false;
  @HostBinding('class.disabled') @Input() disabled = false;

  @ViewChild('search') searchInput: ElementRef;

  @Input() optTextColor: any = '#000';
  @Input() arrowIcon: any = 'url(/assets/icons/arrow-simple.svg)';
  @Input() title = '';
  @Input() items: Array<any>;
  @Input() filterValue: any;
  // @Output() value = new EventEmitter<string>();
  @Output() change = new EventEmitter<string>();
  filteredItems: Array<any> = [];

  constructor(
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    this.optTextColor = this.sanitizer.bypassSecurityTrustStyle('--opt-text-color: ' + this.optTextColor);
    this.arrowIcon = this.sanitizer.bypassSecurityTrustStyle('--opt-arrow-icon: ' + this.arrowIcon);

    this.setFilteredItems(this.items);
  }

  ngOnChanges(changes: any) {
    if (changes.items && !changes.items.firstChange) {
      this.setFilteredItems(changes.items.currentValue);
    }
  }

  open() {
    if (this.disabled) { return; }
    this.showFilter = true;
    this.searchInput.nativeElement.focus();
  }

  close() {
    setTimeout(() => {
      this.showFilter = false;
    }, 250);
  }

  filter($event: any) {
    if (this.items === undefined) { return; }
    this.filteredItems = this.items.filter((elem) => {
      const searchStr = this.searchInput.nativeElement.value.toLowerCase();
      const searchInValue = elem.value.toString().toLowerCase().indexOf(searchStr) !== -1;
      const searchInLabel = elem.label.toString().toLowerCase().indexOf(searchStr) !== -1;
      return searchInValue || searchInLabel;
    });
  }

  selectitem(event: any, item: any) {
    this.filterValue = item;
    this.change.emit(this.filterValue);
  }

  clear() {
    this.filterValue = '';
    this.change.emit(this.filterValue);
  }

  isFilterActive() {
    return this.showFilter || this.searchInput.nativeElement.value !== '';
  }

  getPlaceholder() {
    const firstCondition = this.filterValue && typeof this.filterValue === 'string';
    return firstCondition ? this.filterValue : this.filterValue && this.filterValue.label ? this.filterValue.label : '';
  }

  private setFilteredItems(items: any) {
    this.items = items;
    if (items && items.length && typeof items[0] === 'string') {
      this.items = items.map((elem: any) => ({value: elem, label: elem}));
    }
    this.filteredItems = this.items;
  }

}
