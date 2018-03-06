# Mapbox marker handler

## API Reference

### Usage in your application

```js
import { MapboxMarkerHandler } from '@geographica/latitude';
```

**Example setup**

```js
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v8',
  center: [40, -74.50],
  zoom: 9
});

var MarkerHandler = new MapboxMarkerHandler();
MarkerHandler.init(map, {
  style: {
    'id': 'simulated-stored-active-points',
    'type': 'symbol',
    'layout': {
      'icon-image': {
        'property': 'selected',
        'default': 'marker-loading',
        'type': 'categorical',
        'stops': [
          [1, 'marker-selected']
        ]
      },
      'icon-allow-overlap': true
    },
  }
});
```

### Options

All of the following options are optional.

- `styles`, Array\<Object\>: An array of map style objects. By default, this class provides a map style for you.


### Modes

#### `select`
Lets you select and drag markers.

 and will automatically transition into `select` mode again every time the user exits the `remove` or `add` mode.

#### `add`
Lets you draw a Point feature.

`add` is the mode used by default, and it will automatically transition into `select` mode after a marker is added.

#### `remove`
Remove the selected Point feature.

`remove` mode will automatically transition into `add` mode after all the markers are removed.



## API Methods

`new MapboxMarkerHandler().init()` returns an instance of MapboxMarkerHandler with the following API:

### `add(m: Array) => Feature<geojson>`

This method takes an array with coordinates and add it in the geojson object, it returns the added feature (with the generated id).

Example:
```js
var feature = markerHandler.add([-4.33, 39.44]);
console.log(feature);
//=> { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.33, 39.44] }, "properties": { id: 1 } }
```

---
### `get(featureId: id): ?Feature<geojson>`

Returns the GeoJSON feature with the specified id, or `undefined` if the id matches no feature.

Example without a specified feature id:

```js
var feature = markerHandler.add([-4.33, 39.44]);
console.log(markerHandler.get(feature.properties.id));
//=> { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.33, 39.44] }, "properties": { id: 1 } }
```

---
### `remove(featureId: id)`

Removes the feature with the specified id.

---
### `trash()`

Invokes the current mode's `trash` action.

In `select` mode, this deletes the selected feature.

If you want to delete features regardless of the current mode, use the `remove` function.


---
### `getSelected(): Feature`

Returns the feature for the selected Point.


---
### `getMode(): string`

Returns the current mode.

---
### `setMode(mode: string, markerId?: number)`

Changes to another mode.

The `mode` argument must be one of the mode names described below

`select`, `add`, and `remove`, this last mode accept a `featureId` and in the case that it is provided, it will delete the feature with that id.



---
### `setStyle(style: Array\<Object\>)`

Change the style with the received array of map style objects.
For more information check the official mapbox-gl-style spec https://www.mapbox.com/mapbox-gl-style-spec/



## Events

MarkerHandler fires a some map events. All of these events are namespaced with `latitudeMarkers:` and are emitted from the Mapbox GL JS map object. All events are all triggered by user interaction.

```js
map.on('latitudeMarkers:add', function (featurePoint) {
  console.log(featurePoint);
});
```

### `latitudeMarkers:add`

Fired when a point feature is created.
The event data is an object with the new feature GeoJSON.


### `latitudeMarkers:remove`

Fired when a point feature is removed.
The event data is an object with the deleted feature GeoJSON.

### `latitudeMarkers:move`

Fired when one feature is moved.
The event data is an object with the feature GeoJSON including the new coordinates.
