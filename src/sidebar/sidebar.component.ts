import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'latitude-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() show: boolean = true;

  constructor() { }

  ngOnInit() {
  }

}
