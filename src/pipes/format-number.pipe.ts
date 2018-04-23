import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from 'ng2-translate';

@Pipe({
  name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  transform(value, _options = {}): any {
    const options = {tailStyle: '', units: '', tail: '', places: 2, compact: false, reversedUnit: false, lang: (this.translateService.currentLang || 'en')};

    (<any>Object).assign(options, _options);

    const negative = value < 0 ? '-' : '',
    thousand = options.lang === 'en' ? ',' : '.',
    decimal = options.lang === 'en' ? '.' : ',';

    if (options.compact) {
      value = parseFloat(value);
      let tail = '';
      if (value > 1000000000000) {
        value = value / 1000000000000;
        tail = 'T';
      } else if (value > 1000000000) {
        value = value  / 1000000000;
        tail = 'B';
      } else if (value > 1000000) {
        value = value / 1000000;
        tail = 'M';
      } else if (value > 1000) {
        value = value / 1000;
        tail = 'K';
      }
      if (tail && options.tailStyle) {
        tail = `<span style="${options.tailStyle}">${tail}</span>`;
      }
      const compacted = {
        number: parseFloat(value.toFixed(options.places)),
        tail: tail
      };
      value = compacted.number;
      options.tail = compacted.tail;

    } else {
      options.units = ' ' + options.units;
    }

    options.tail = options.tail ? options.tail : '';
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

    let final = part_1 + part_2 + part_3 + options.tail + options.units;
    if (options.reversedUnit) {
      final = options.units + part_1 + part_2 + part_3 + options.tail;
    }
    return final;
  }

}
