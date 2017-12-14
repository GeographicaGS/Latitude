import { default as booleanDisjoint } from '@turf/boolean-disjoint';
import { polygon } from '@turf/helpers';
import * as _ from 'lodash';

export class DataSource {
  // Type could be local, in the future could be 'https'
  type: string;
  // Input. Just for type local
  localInput: any;

  // opts = {
  //  input: { stream: null, format: 'geojson' } ,
  //
  // }

  constructor(type: string, opts: any) {
    this.type = type;
    if (type === 'local') {
      this.localInput = opts.input;
    }
  }

  // This method handles the data (either coming from this.data.stream or from a service)
  // type: could be 'histogram' or 'variable'
  // opts: { bbox: [turf polygon], agg: 'count(*)', property: 'age'}
  fetch(type: string, opts: any) {
    return new Promise((resolve, reject) => {
      if (this.type === 'local') {
        const data = this.applyFilters(opts);
        const agg = this.parseAgg(opts.agg);
        if (type === 'histogram') {
          resolve(this.groupBy(data, opts.property, agg));
        } else if (type === 'variable') {
          resolve( {
            value: this.aggregator(data, agg)
          });
        } else {
          reject(new Error(`Unknown type ${type}`));
        }
      } else if (this.type === 'https') {
        // TODO: This would be a service call
        throw Error('Not yet supported');
      }
    });
  }

  private parseAgg(agg) {
    const re = /(.*)\((.*)\)/g;
    const m = re.exec(agg);
    return {
      op: m[1],
      prop: m[2]
    };
  }

  private groupBy(data: Array < Object > , property: string, agg: any): Array < Object > {
    const group = _.groupBy(data, f => {
      const p = f.properties || f;
       return p && p[property] ? p[property] : 'uncategorized';
    });

    const resp = [];
    for (const i in group) {
      if (i) {
        resp.push({
          category: i,
          value: this.aggregator(group[i], agg)
        });
      }
    }
    return resp;
  }

  private aggregator(data: Array < Object > , agg: any) {
    if (agg.op === 'sum') {
      // || is to support GEOJSON arrays
      return data.reduce((acc, v: any) => (v[agg.prop] || v.properties[agg.prop]) + acc);
    } else if (agg.op === 'count') {
      return data.length;
    }
  }

  // Apply filters (only 'bbox' for now)
  private applyFilters(opts: any) {
    if (opts.bbox && this.localInput.format === 'geojson') {
      return this.localInput.stream.filter(feature => {
        return !booleanDisjoint(feature.geometry, opts.bbox);
      });
    } else {
      return this.localInput.stream;
    }
  }

  histogramOrderBy(data: Array<Object>, field: string='value') {
    return _.sortBy(data, field);
  }

  histogramPercentage(data: Array<Object>) {
    const max = _.sumBy(data, 'value');
    return data.map((d: any) => {
      d['perc'] = 100 * d.value / max;
      return d;
    });
  }

  flatternDoubleHistogram(data: Array<Object>) {
    return _.flatMap(data, n =>
        n.value.map(d=> {
          d['category_1'] = n.category;
          d['category_2'] = d.category;
          delete d.category;
          return d;
        })
      );
  }

  rankingDoubleHistogram(data: Array<Object>) {
    return _.sortBy(this.flatternDoubleHistogram(data));
  }

}
