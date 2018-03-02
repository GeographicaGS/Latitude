export class MapboxMarkerHandler {

  private map: any;
  private mode = 'add';
  private modes = ['add', 'select', 'remove'];
  private source = 'point';
  private style = {
    "id": "point",
    "type": "circle",
    "source": this.source,
    "paint": {
      "circle-radius": 10,
      "circle-color": "#3887be"
    }
  };
  private customizableProperties = ['style'];
  private geojson: any = false;
  private isCursorOverPoint = false;
  private isDragging = false;
  private clickEventsReady = false;
  private selectEventsReady = false;
  private canvas: any = false;
  private markers = [];
  private selected: number;
  private clickEvent = true;
  private markerClickedFunc = this._markerClickedFunc.bind(this);

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
    this._addMarker({lngLat: {lng: m[0], lat: m[1]}});
  }

  remove(id: number) {
    if (this.markers.find(m => m.properties.id === id)) {
      this.markers = this.markers.filter(m => m.properties.id !== id);
      this.geojson.features = this.markers;
      this.updateData();
    }
  }

  _markerClickedFunc(e) {
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
    this.map.getSource(this.source).setData(this.geojson);
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
      this.map.on('mousedown', this.style.id, mouseDown);
    }
    this.selectEventsReady = true;
    this.clickEvent = false;

    const self = this;
    function mouseDown(e) {
      if (!self.isCursorOverPoint) {
        return;
      }
      self.selected = e.features[0].properties.id;
      self.isDragging = true;
      // Mouse events
      self.map.on('mousemove', onMove);
      self.map.once('mouseup', onUp);
    }
    function onMove(e) {
      if (!self.isDragging) return;
      const coords = e.lngLat;
      for (let m of self.markers) {
        if (m.properties.id === self.selected) {
          m.geometry.coordinates = [coords.lng, coords.lat];
        }
      }
      self.updateData();
    }
    function onUp(e) {
      if (!self.isDragging) return;
      self.isDragging = false;
      self.map.off('mousemove', onMove);
      self.map.off('mousemove', mouseDown);
    }
  }

  private getId() {
    if (!this.markers.length) { return 1; }
    return this.markers[this.markers.length - 1].properties.id + 1;
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
    this.map.fire('latitudeMarkers:add', geojson);
  }

  destroy() {
    this.map.off('click', this.style.id, this.markerClickedFunc);
    this.map.removeSource(this.source);
    this.map.removeLayer(this.style.id);
  }
}
