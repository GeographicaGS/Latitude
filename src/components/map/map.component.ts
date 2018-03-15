import { Component, OnInit, Input, Output, Inject, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import * as mapstyle from '../../assets/mapstyle/style';
import * as mapboxgl from 'mapbox-gl';
import { default as centroid } from '@turf/centroid';
import { default as bboxPolygon } from '@turf/bbox-polygon';
import { MapService } from './map.service';

@Component({
  selector: 'latitude-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer;
  map: any;

  private mapStyle: any = mapstyle.style;
  private popupHover: any;
  private popupClick: any;
  private isMapLoaded = false;
  private layersQueue: any[] = [];

  private _disabled = false;
  @Input('disabled')
  set disabled(val) {
    if (val !== this._disabled) {
      this._disabled = val;
      this.setMap();
    }
  }
  @Input() center: number[] = [0, 0];
  @Input() zoom = 0;
  @Input() customStyle: any = false;
  @Input() zoomControl = false;
  @Output() mapLoaded = new EventEmitter();
  @Output() bboxChanged = new EventEmitter();

  constructor(@Inject('config') private config: any, private mapService: MapService) {
    if (!config.mapbox || (config.mapbox && config.mapbox.accessToken)) {
      mapboxgl.accessToken = config.mapbox.accessToken;
    } else {
      throw new Error('LatitudeModule -> MapComponen needs to get an mapbox.accessToken in the config object');
    }
  }

  ngOnInit() {
    if (this.customStyle) {
      this.mapStyle = this.customStyle;
    }
    if (typeof this.mapStyle !== 'string') {
      this.mapStyle['sprite'] = this.mapStyle['sprite'].indexOf('http') !== -1 ? this.mapStyle['sprite'] : window.location.origin + this.mapStyle['sprite']
    }

    this.setMap();
  }

  private setMap() {
    this.mapRemoval();

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: this.mapStyle,
      center: this.center,
      zoom: this.zoom,
      interactive: !this._disabled
    });

    if (this.zoomControl) {
      this.map.addControl(new mapboxgl.NavigationControl())
    }
  
    this.map.on('load', () => {
      this.isMapLoaded = true;
      this.mapLoaded.emit(this.map);
      this.mapService.setMap(this.map);
      while (this.layersQueue.length) {
        const layer = this.layersQueue.pop();
        this.map.addLayer(layer);
      }

      this.map.on('moveend', (event) => {
        this.bboxChanged.emit(this.getBBOX());
      });
    });
  }

  addSource(id: string, data: any) {
    const sourceData = {
      type: 'geojson',
      data: data
    };
    this.map.addSource(id, sourceData);
  }

  updateSource(id: string, data: any) {
    this.map.getSource(id).setData(data);
  }

  addPointLayer(id: string, data: any, layout: any, styles: any = null, filter: any[] = null, before: string = null) {
    const layerInfo = {
      id: id,
      type: 'symbol',
      source: data,
      layout: layout
    };
    if (styles) {
      layerInfo['paint'] = styles;
    }
    if (filter) {
      layerInfo['filter'] = filter;
    }
    this.loadLayer(layerInfo, before);

    // Pointer cursor
    this.map.on('mouseenter', id, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', id, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  addPolygonLayer(id: string, data: any, styles: any, filter: any[] = null, before: string = null, extrude = false) {
    const layerInfo = {
      id: id,
      type: extrude ? 'fill-extrusion' : 'fill',
      source: data,
      layout: {},
      paint: styles
    };
    if (filter) {
      layerInfo['filter'] = filter;
    }
    this.loadLayer(layerInfo, before);

    // Pointer cursor
    this.map.on('mouseenter', id, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', id, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  addCircleLayer(id: string, data: any, styles: any, filter: any[] = null, before: string = null) {
    const layerInfo = {
      id: id,
      type: 'circle',
      source: data,
      layout: {},
      paint: styles
    };
    if (filter) {
      layerInfo['filter'] = filter;
    }
    this.loadLayer(layerInfo, before);
  }

  hideLayer(id: string) {
    this.map.setLayoutProperty(id, 'visibility', 'none');
  }

  showLayer(id: string) {
    this.map.setLayoutProperty(id, 'visibility', 'visible');
  }

  setLayerStyle(id: string, style: any) {
    for (const prop in style) {
      this.map.setPaintProperty(id, prop, style[prop]);
    }
  }

  addLayer(layer: any) {
    this.map.addLayer(layer);
  }

  private loadLayer(layerInfo: any, before: string = null) {
    if (this.isMapLoaded) {
      this.map.addLayer(layerInfo, before);
    } else {
      this.layersQueue.push(layerInfo);
    }
  }

  click(element: string, action: any) {
    this.map.on('click', element, (e) => {
      action(e, this.map);
    });
  }

  setHoverPopup(layer: string, content: Function, anchor = 'bottom', offset = [0, 0]) {
    this.popupHover = this.popupHover || new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: anchor,
        offset: offset
    });

    this.map.on('mousemove', layer, async (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [layer]
      });
      if (features && features.length) {
        let latlng = null;
        if (features[0].geometry.type === 'Point') {
          latlng = features[0];
        } else {
          latlng = centroid(features[0].geometry);
        }
        this.popupHover.setLngLat(latlng.geometry.coordinates)
              .setHTML(await content(features[0]))
              .addTo(this.map);
      }
    });

    this.map.on('mouseleave', layer, (e) => {
      this.popupHover.remove();
    });
  }

  setClickPopup(layer: string, content: Function, anchor = 'bottom', offset = [0, 0], closeCallback = null) {
    this.popupClick = this.popupClick || new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        anchor: anchor,
        offset: offset
    });

    if (closeCallback) {
      this.popupClick.on('close', closeCallback);
    }

    this.map.on('click', layer, async (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [layer]
      });
      if (features && features.length) {
        let latlng = null;
        if (features[0].geometry.type === 'Point') {
          latlng = features[0];
        } else {
          latlng = centroid(features[0].geometry);
        }
        if (this.popupHover) {
          this.popupHover.remove();
        }
        this.popupClick.setLngLat(latlng.geometry.coordinates)
              .setHTML(await content(features[0]))
              .addTo(this.map);
      }
    });
  }

  setFilter(layer: string, filter: string[]) {
    this.map.setFilter(layer, filter);
  }

  flyTo(options: any) {
    this.map.flyTo(options);
  }

  flyToBbox(bbox, options) {
    this.map.fitBounds(bbox, options);
  }

  addImage(name, url) {
    return new Promise((resolve, reject) => {
      this.map.loadImage(url, (error, image) => {
        if (error) {
          reject(error);
        }
        this.map.addImage(name, image);
        resolve();
      });
    });
  }

  getBBOX(): any {
    const bounds = this.map.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();
    return bboxPolygon([sw.lng, sw.lat, ne.lng, ne.lat]);
  }

  getMapPosition() {
    return {
      center: this.map.getCenter(),
      zoom: this.map.getZoom(),
      pitch: this.map.getPitch(),
      bearing: this.map.getBearing()
    };
  }

  resize() {
    this.map.resize();
  }

  private mapRemoval() {
    if (this.map) {
      // Since we are destroying and creating the map again,
      // We need to make sure that the mapService set the map as false,
      // So the application knows about it and we do not call any map function in the meantime
      // (like map.getSource, map.getLayer, that will throw "cannot executa getSource of undefined"
      this.mapService.setMap(false);
      this.map.remove();
    }
  }

  ngOnDestroy() {
    this.mapRemoval();
  }

}
