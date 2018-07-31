import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'latitude-tab-navigation',
    templateUrl: 'tab-navigation.component.html',
    styleUrls: ['tab-navigation.component.scss']
})
export class TabNavigationComponent implements OnInit, OnChanges {
  public activeTab = 0;
  @Input() tabs: string[];
  @Input() private selectedTab: number = 0;
  @Output() private change = new EventEmitter<number>();

  constructor() { }

  ngOnInit() { }

  public changeTab(index: number) {
    if (index === this.activeTab) {
      return;
    }
    this.activeTab = index;
    this.change.emit(index);
  }

  ngOnChanges(changes) {
    if (changes && changes.selectedTab && changes.selectedTab.currentValue !== changes.selectedTab.previousValue) {
      this.changeTab(changes.selectedTab.currentValue);
    }
  }

  setActiveTab(tabIndex) {
    this.changeTab(tabIndex);
  }
}
