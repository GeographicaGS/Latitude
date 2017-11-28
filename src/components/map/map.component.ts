import { Component, OnInit, Input, Output, Inject, EventEmitter } from '@angular/core';
import * as mapstyle from '../../assets/mapstyle/style';
import * as mapboxgl from 'mapbox-gl';
import { default as centroid } from '@turf/centroid';
import { default as bboxPolygon } from '@turf/bbox-polygon';

@Component({
  selector: 'latitude-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map: any;

  private mapStyle: any = mapstyle.style;
  private popupHover: any;
  private popupClick: any;
  private isMapLoaded = false;
  private layersQueue: any[] = [];

  @Input() center: number[] = [0, 0];
  @Input() zoom = 0;
  @Input() customStyle: any = false;
  @Input() disabled = false;
  @Output() mapLoaded = new EventEmitter();
  @Output() bboxChanged = new EventEmitter();

  constructor(@Inject('config') private config: any) {
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
    this.mapStyle['sprite'] = this.mapStyle['sprite'].indexOf('http') !== -1 ? this.mapStyle['sprite'] : window.location.origin;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.mapStyle,
      center: this.center,
      zoom: this.zoom,
      interactive: !this.disabled
    });

    this.map.on('load', () => {
      this.isMapLoaded = true;
      this.mapLoaded.emit();
      while (this.layersQueue.length) {
        const layer = this.layersQueue.pop();
        this.map.addLayer(layer);
      }

      this.map.on('moveend', (event) => {
        this.bboxChanged.emit(this.getBBOX());
      });
    });
  }

  ngOnChanges(changes) {
    if (changes.disabled && !changes.disabled.firstChange && changes.disabled.currentValue !== changes.disabled.previousValue) {
      // this.map._interactive = !changes.disabled.currentValue;
    }
  }

  addSource(id: string, data: any) {
    console.log('data', data);
    const sourceData = {
      type: 'geojson',
      data: data
    };
    this.map.addSource(id, sourceData);
  }

  updateSource(id: string, data: any) {
    this.map.getSource(id).setData(data);
  }

  addPointLayer(id: string, data: any, styles: any, filter: any[] = null, before: string = null) {
    const layerInfo = {
      id: id,
      type: 'symbol',
      source: data,
      layout: styles
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

  getBBOX() {
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

}
