import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { MapService } from '../../map/map.service';
import { default as bboxPolygon} from '@turf/bbox-polygon';

@Component({
  selector: 'app-widget-base',
  templateUrl: './widget-base.component.html',
  styleUrls: ['./widget-base.component.scss']
})
export class WidgetBaseComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  map: any;
  moveend = this._moveend.bind(this);
  @Input() bboxFilter = false;
  @Input() formatOptions: object = null;

  private widgetData;
  @Input() set data(data) {
    this.widgetData = data;
    if (this.map) {
      this.renderData();
    }
  }
  get data() {
    return this.widgetData;
  }

  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.subscription = this.mapService.map$.subscribe((map) => {
      if (map) {
        this.map = map;
        if (this.bboxFilter) {
          map.on('moveend', this.moveend);
        }
        this.renderData();
      }
    });
  }

  private renderData() {
    if (this.data instanceof Array) {
      this.render(this.data);
    } else {
      this._moveend();
    }
  }

  _moveend() {
    this.fetch({bbox: this.getBBOX() });
  }

  getBBOX(): any {
    if (!this.bboxFilter || !this.map) {
      return null;
    } else {
      const bounds = this.map.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();
      return bboxPolygon([sw.lng, sw.lat, ne.lng, ne.lat]);
    }
  }

  fetch(opts) {
    throw Error('Virtual method called');
  }

  render(data) {
    throw Error('Virtual method called');
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
