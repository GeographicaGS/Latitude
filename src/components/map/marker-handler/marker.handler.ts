export class MapboxMarkerHandler {

  private map: any;
  private mode = 'add';
  private modes = ['add', 'select', 'remove'];
  private source = 'point';
  private customizableProperties = ['style'];
  private geojson: any = false;
  private isCursorOverPoint = false;
  private isDragging = false;
  private clickEvent = true;
  private clickEventsReady = false;
  private selectEventsReady = false;
  private markers = [];
  private selected: number;
  private markerClickedFunc = this._markerClickedFunc.bind(this);
  private mouseDownFunc = this._mouseDown.bind(this);
  private mouseMoveFunc = this._onMove.bind(this);
  private mouseUpFunc = this._onUp.bind(this);
  private style = {
    "id": "point",
    "type": "circle",
    "source": this.source,
    "paint": {
      "circle-radius": 10,
      "circle-color": "#3887be"
    }
  };

  constructor() {}

  init(map: any, properties: any = false) {
    this.map = map;
    if (properties) {
      for (let propName in properties) {
        if (
          properties[propName] &&
          this[propName] &&
          this.customizableProperties.indexOf(propName) !== -1
        ) {
          this[propName] = properties[propName];
        }
      }
      this.customPropertiesConstraints();
    }
    this.setMode('add');
    this.handleMode();
  }

  getMode() {
    return this.mode;
  }

  setMode(mode: any, markerId: any = false) {
    if (this.modes.indexOf(mode) === -1) { return; }
    this.mode = mode;
    if (this.mode === 'select' && markerId) {
      if (this.markers.find(c => c.properties.id !== markerId)) {
        this.selected = markerId;
      }
    } else if (mode === 'add') {
      this.clickEvent = true;
    }
    this.handleMode();
  }

  getModes() {
    return this.modes;
  }

  getStyle() {
    return this.style;
  }

  setStyle(style: any) {
    this.style = style;
  }

  trash() {
    if (this.markers.find(m => m.properties.id === this.selected)) {
      this.map.fire('latitudeMarkers:remove', this.markers.find(m => m.properties.id === this.selected));
      this.markers = this.markers.filter(m => m.properties.id !== this.selected);
      this.geojson.features = this.markers;
      this.selected = -1;
      this.updateData();
      // After a deletion
      if (!this.markers.length) {
        this.setMode('add');
      }
    }
  }

  getSelected() {
    if (this.selected === -1) { return null; }
    return this.markers.length > 0 ? this.markers.find(m => m.properties.id === this.selected) : null;
  }

  getMarkers() {
    return this.markers;
  }

  add(m) {
    const geojson = this._addMarker({lngLat: {lng: m[0], lat: m[1]}});
    return geojson;
  }

  remove(id: number) {
    if (this.markers.find(m => m.properties.id === id)) {
      this.markers = this.markers.filter(m => m.properties.id !== id);
      this.geojson.features = this.markers;
      this.updateData();
    }
  }

  private getId() {
    if (!this.markers.length) { return 1; }
    return this.markers[this.markers.length - 1].properties.id + 1;
  }

  private customPropertiesConstraints() {
    // Style / Source - Relation
    if (this.style['source'] === undefined) {
      this.style['source'] = this.source;
    } else if (this.style['source'] && this.style['source'] !== this.source) {
      this.source = this.style['source'];
    }
  }

  private handleMode() {
    if (this.mode === 'add') {
      this.handleAdd();
    } else if (this.mode === 'select') {
      this.handleSelect();
    } else if (this.mode === 'remove') {
      this.handleRemoval();
    }
  }

  private handleRemoval() {
    this.trash();
  }

  private updateData() {
    const source = this.map.getSource(this.source);
    if (source) {
      source.setData(this.geojson);
    }
  }

  private handleAdd() {
    if (this.clickEventsReady) { return; }
    this.clickEventsReady = true;
    this.map.on('mouseenter', this.style.id, () => {
      this.map.getCanvas().style.cursor = 'pointer';
      this.isCursorOverPoint = true;
      this.map.dragPan.disable();
    });

    this.map.on('mouseleave', this.style.id, () => {
      this.map.getCanvas().style.cursor = '';
      this.isCursorOverPoint = false;
      this.map.dragPan.enable();
    });

    this.map.on('click', this.style.id, this.markerClickedFunc);

    this.map.on('click', (e) => {
      if (!this.clickEvent) {
        return;
      }
      this._addMarker(e);
    });
  }

  private handleSelect() {
    if (!this.selectEventsReady) {
      this.map.on('mousedown', this.style.id, this.mouseDownFunc);
    }
    this.selectEventsReady = true;
    this.clickEvent = false;
  }

  private _mouseDown(e) {
    if (!this.isCursorOverPoint) {
      return;
    }
    this.selected = e.features[0].properties.id;
    this.isDragging = true;
    // Mouse events
    this.map.on('mousemove', this.mouseMoveFunc);
    this.map.once('mouseup', this.mouseUpFunc);
  }

  private _onMove(e) {
    if (!this.isDragging) return;
    const coords = e.lngLat;
    for (let m of this.markers) {
      if (m.properties.id === this.selected) {
        m.geometry.coordinates = [coords.lng, coords.lat];
      }
    }
    this.updateData();
  }

  private _onUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.map.off('mousemove', this.mouseMoveFunc);
    this.map.off('mouseup', this.mouseUpFunc);
    this.map.off('mousedown', this.mouseDownFunc);
    this.map.fire('latitudeMarkers:move', JSON.parse(JSON.stringify(this.markers.find(m => m.properties.id === this.selected))));
  }

  private _markerClickedFunc(e) {
    if (
      e.features &&
      e.features[0] &&
      e.features[0].properties &&
      e.features[0].properties.id) {
        const id = e.features[0].properties.id;
        if (this.markers.find(m => m.properties.id === id)) {
          if (this.getMode() === 'select') {
            if (id === this.selected) {
              this.selected = -1;
            } else {
              this.selected = id;
            }
          } else if (this.getMode() === 'remove') {
            this.selected = id;
            this.trash();
          }
        }
      }
  }

  private _addMarker(e) {
    let geojson = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [e.lngLat.lng, e.lngLat.lat]
      },
      "properties": {
        "id": this.getId()
      }
    };
    this.markers.push(geojson);

    if (!this.geojson) {
      this.geojson = {
        "type": "FeatureCollection",
        "features": this.markers
      };
    } else {
      this.updateData();
    }
    if (!this.map.getSource(this.source)) {
      this.map.addSource(this.source, {
          "type": "geojson",
          "data": this.geojson
      });
      this.map.addLayer(this.style);
    }

    // Select the last marker
    this.selected = geojson.properties.id;
    this.setMode('select', this.selected);
    this.map.fire('latitudeMarkers:add', JSON.parse(JSON.stringify(geojson)));
    return geojson;
  }

  destroy() {
    if (this.map) {
      this.map.off('click', this.style.id, this.markerClickedFunc);
      this.markers = [];
      this.geojson.features = this.markers;
      this.selected = -1;
      if (this.map.getLayer(this.style.id)) {
        this.map.removeLayer(this.style.id);
      }
      if (this.map.getSource(this.source)) {
        this.map.removeSource(this.source);
      }
    }
  }
}
