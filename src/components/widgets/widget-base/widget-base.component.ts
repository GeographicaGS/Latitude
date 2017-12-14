import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { MapService } from '../../map/map.service';

@Component({
  selector: 'app-widget-base',
  templateUrl: './widget-base.component.html',
  styleUrls: ['./widget-base.component.scss']
})
export class WidgetBaseComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  map: any;
  moveend = this._moveend.bind(this);
  @Input() bboxFilter = true;
  @Input() formatOptions: object = null;

  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.subscription = this.mapService.map$.subscribe((map) => {
      if (map) {
        this.map = map;
        if (this.bboxFilter) {
          map.on('moveend', this.moveend);
        }
      }
    });
  }

  _moveend() {
    console.log(this.map.getBounds());
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.map && this.bboxFilter) {
      this.map.off('moveend', this.moveend);
    }
  }

}
