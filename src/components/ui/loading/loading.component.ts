import { Component, OnInit, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'latitude-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  @Input() color: String;
  @Input() width: Number;

  @HostBinding('class.show')
  @Input() show: Boolean = false;

  ngOnInit() { }
}
