import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'latitude-tab-navigation',
    templateUrl: 'tab-navigation.component.html',
    styleUrls: ['tab-navigation.component.scss']
})

export class TabNavigationComponent implements OnInit {
  public activeTab = 0;
  @Input() private tabs: string[];
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
}
