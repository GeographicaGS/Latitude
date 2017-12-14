import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {

  transform(value, _options = {}): any {
    const options = {units: '', places: 2, compact: false, lang: 'en'};

    (<any>Object).assign(options, _options);

    const negative = value < 0 ? '-' : '',
    thousand = options.lang === 'en' ? ',' : '.',
    decimal = options.lang === 'en' ? '.' : ',';

    if (options.compact) {
      value = parseFloat(value);
      let tail = '';
      if (value > 1000000) {
        value = value / 1000000;
        tail = 'M';
      } else if (value > 1000) {
        value = value / 1000;
        tail = 'K';
      }
      const compacted = {
        number: parseFloat(value.toFixed(options.places)),
        tail: tail
      };
      value = compacted.number;
      options.units = compacted.tail + ' ' + options.units;

    } else {
      options.units = ' ' + options.units;
    }

    options.units = options.units === ' ' ? '' : options.units;

    const i = parseInt(value = Math.abs(+value || 0).toFixed(options.places), 10) + '';
    let j = i.length;
    j = j > 3 ? j % 3 : 0;
    const part_1 = negative + (j ? i.substr(0, j) + thousand : '');
    const part_2 = i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand);
    let part_3 = (options.places ? decimal + Math.abs(value - <any>i).toFixed(options.places).slice(2) : '');
    if (part_3 === '.00' || part_3 === '.0') {
      part_3 = '';
    }

    return part_1 + part_2 + part_3 + options.units;
  }

}
