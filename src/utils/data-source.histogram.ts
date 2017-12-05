import { default as intersect } from '@turf/intersect';
import { polygon } from '@turf/helpers';
import * as _ from 'lodash';

export class DataSourceHistogram {
  // Format can be 'geojson' || 'service' (only geojson for now) || 'json' (when want to send directly the results)
  format: string;
  // Data is an object with the next properties
  // - stream: [GeoJSON.featuresCollection] || serviceRequest which returns a [GeoJSON.featuresCollection]
  // - property: (string) property which will be used to group the features
  // - agg: (object) {operation: (string) 'sum' || 'count', property: (string) 'feature.property' || (null) (in the case of count)}
  data: any;
  // Bounding box (turf.polygon)
  bbox: any;

  histogram: any;
  doubleHistogram: boolean;

  constructor(
    filters: any = false,
    data: any = {stream: null, property: 'id', agg: {operation: 'count', property: null}},
    format = 'geojson',
    results: any = false,
    doubleHistogram = false
  ) {
    this.data = data;
    this.format = format;
    this.doubleHistogram = doubleHistogram;
    if (filters && filters.bbox) {
      this.bbox = polygon(filters.bbox);
    }
    if (format === 'json' && results) {
      this.histogram = results;
    }
  }

  // This method handles the data (either coming from this.data.stream or from a service)
  // It should always return a valid format, [{id: --, value: --}, ...] ---- this is done in the last step (this.applyOperation)
  fetch() {
    return new Promise((resolve, reject) => {
      let data: any = [];
      if (this.format === 'geojson') {
        data = this.applyFilters(); // Apply filters (bbox for now)
        data = this.groupBy(data); // Group by this.data.property
        data = this.applyOperation(data); // Apply this.data.agg.operation (sum | count)
      } else if (this.format === 'service') {
        // TODO: This would be a service call
      } else if (this.format === 'json') {
        data = this.histogram;
        if (this.doubleHistogram) {
          data = this.formatDataForStackedBar(data);
        } else {
          data = data.map((c) => {
            if (c.category && !c.id) {
              return {id: c.category, value: c.value};
            } else {
              return {id: c.id, value: c.value};
            }
          });
        }
      }
      resolve(data);
    });
  }

  // Apply filters (only 'bbox' for now)
  private applyFilters() {
    return this.data.stream.filter(feature => {
      return this.bboxFilter(feature);
    });
  }

  // Group GeoJSON.features by this.data.property
  private groupBy(data) {
    return _.groupBy(data, f => {
       return f.properties && f.properties[this.data.property] ? f.properties[this.data.property] : 'uncategorized';
    });
  }

  // Apply the operation defined in this.data.agg
  // Will return [{id: --, value: --}, {id: --, value: --}...]
  private applyOperation(data) {
    const categories = Object.keys(data);
    if (this.data.agg.operation === 'count') {
      data = categories.map(c => {
        return {id: c, value: data[c].length};
      });
    } else if (this.data.agg.operation === 'sum') {
      data = categories.map(c => {
        const total = data[c].reduce((sum, num) => {
          return sum + num.properties[this.data.agg.property];
        }, 0);
        return {id: c, value: total};
      });
    }
    return data;
  }

  // Apply intersect between the received feature coordinates and the defined bbox
  private bboxFilter(feature) {
    let response: any = true;
    if (this.bbox) {
      response = intersect(polygon(feature.geometry.coordinates), this.bbox);
    }
    return response;
  }

  private formatDataForStackedBar(data) {
    if (data === null) { return; }
    let formattedData = [];
    for (const row of data) {
      if (row.category === 'Unknown') {
        continue;
      }
      const obj = {};
      obj['Label'] = row.category;
      for (const value of row.value) {
        obj[value.category] = value.value;
      }
      formattedData.push(obj);
    }
    return formattedData;
  }

};
