import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'toggle',
  inputs: ['label','checked'],
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
export class ToggleComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
