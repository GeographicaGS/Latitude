# Inputs
### colors: any = false;
Object that will be used to assign colours to the categories, example:
```js
catColors = {
    'cat_one': 'blue',
    'cat_two': 'green',
    'cat_three': 'red'
};
```
### labels: any = false;
Object that will be used to override the categories labels, example:
```js
catLabels = {
    'cat_one': 'Category 1',
    'cat_two': 'Category 2',
    'cat_three': 'Category 3'
};
```
### title: string;
Just a string for the widget's headline text.

### dataSource: any;
Object which needs to have a "fetch" method so that the widget will call it in order to receive the data. The way in which "DataSource" is handling the data is NOT a latitude task, BUT the "fetch" method has to return an array of objects which must have the properties "id" and "value".

This is a dataSource example, it gets some geojson features in a collection, applies bbox filters, and performs the aggregation operation.
```typescript
import { default as intersect } from '@turf/intersect';
import { polygon } from '@turf/helpers';
import * as _ from 'lodash';

export class DataSource {
  // Format can be 'geojson' OR 'service' (only geojson for now)
  format: string;
  // Data is an object with the next properties
  // - stream: [GeoJSON.featuresCollection] || serviceRequest which returns a [GeoJSON.featuresCollection]
  // - property: (string) property which will be used to group the features
  // - agg: (object) {operation: (string) 'sum' || 'count', property: (string) 'feature.property' || (null) (in the case of count)}
  data: any;
  // Bounding box (turf.polygon)
  bbox: any;

  constructor(
    filters: any = false,
    data: any = {stream: null, property: 'id', agg: {operation: 'count', property: null}},
    format = 'geojson'
  ) {
    this.data = data;
    this.format = format;
    if (filters && filters.bbox) {
      this.bbox = polygon(filters.bbox);
    }
  }

  // This method handles the data (either coming from this.data.stream or from a service)
  // It should always return a valid format, [{id: --, value: --}, ...] ---- this is done in the last step (this.applyOperation)
  fetch() {
    return new Promise((resolve, reject) => {
      let data = [];
      if (this.format === 'geojson') {
        data = this.applyFilters(); // Apply filters (bbox for now)
        data = this.groupBy(data); // Group by this.data.property
        data = this.applyOperation(data); // Apply this.data.agg.operation (sum | count)
      } else {
        // TODO: This would be a service call
      }
      resolve(data);
    });
  }
 .  .  .  .
};
```

The previous example of dataSource would be instantiated like below:
```typescript
dataSourceSum = new DataSource(
    {bbox: this.bbox},
    {stream: this.geojson.features, property: 'id', agg: {operation: 'sum', property: 'value'}}
  );
```
# Outputs (events)
### disabledCategories
Event is emitted everytime that the user disables/enables a category, the event will send the hidden categories list, sample bellow:
```js
["cat_three", "cat_two"]
```

# In your template
```html
<latitude-widget-category
  [dataSource]="dataSourceSum"
  [title]="'Category widget (SUM)'"
  [labels]="categoryLabels"
  [colors]="categoryColors"
  (disabledCategories)="disabledCategories($event)"
></latitude-widget-category>
```
