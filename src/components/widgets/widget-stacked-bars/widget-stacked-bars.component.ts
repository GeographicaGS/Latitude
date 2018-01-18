import { Component, OnInit, OnDestroy, HostBinding, EventEmitter, Input, Output, ViewChild } from '@angular/core';
// import { Colors } from '../../../common/cons';
import { MapService } from '../../map/map.service';
import { WidgetBaseComponent } from '../widget-base/widget-base.component';
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs/Subscription';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { flatternDoubleHistogram } from '../../../datasources/data-source';

import * as moment from 'moment/moment';
import * as _ from 'lodash';

import {
  D3Service,
  D3,
  Axis,
  BrushBehavior,
  BrushSelection,
  D3BrushEvent,
  ScaleLinear,
  ScaleOrdinal,
  Selection,
  Transition,
  DSV
} from 'd3-ng2-service';

@Component({
  selector: 'latitude-widget-stacked-bars',
  templateUrl: './widget-stacked-bars.component.html',
  styleUrls: ['./widget-stacked-bars.component.scss']
})
export class WidgetStackedBarsComponent extends WidgetBaseComponent implements OnInit, OnDestroy {

  private d3: D3;

  svg: any;
  x: any;
  y: any;
  z: any;
  tooltip: any;

  totalTranslationSubscription: Subscription;
  totalLabel: String;

  dataFormatted: any;
  hiddenCategories = [];
  hiddenRanges = [];
  searchingColor = 'red'; /// TODO: make it dynamic -> Colors.colorPrimary;

  @ViewChild('svgContainer') svgContainer;
  @ViewChild('svgWrapper') svgWrapper;

  @HostBinding('class.filter') @Input() filter = true;

  @Input() title: string;
  @Input() allowFiltering = true;

  @Input() showYAxis = true;
  @Input() categoriesColors: Array<any>;
  @Input() units = '';
  @Input() loading = false;

  @Output() updateHiddenRanges = new EventEmitter<any>(null);
  @Output() updateHiddenCategories = new EventEmitter<any>(null);

  constructor(
    d3Service: D3Service,
    mapService: MapService,
    private translate: TranslateService
  ) {
    super(mapService);
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
    this.setTranslations();
    this.svg = this.d3.select(this.svgContainer.nativeElement);
    super.ngOnInit();
  }

  render(data) {
    this.dataFormatted = (this.formatData(flatternDoubleHistogram(data)));
    if ((!this.dataFormatted || this.dataFormatted.length === 0) && this.svg) {
      this.svg.attr('height', 0);
      return;
    } else if (this.svg) {
      this.svg.attr('height', 200);
    } else if (!this.svg) {
      return;
    }
    this.svgContainer.nativeElement.innerHTML = '';
    const categories = this.categoriesColors.map((cat) => { return cat.category; });
    const colors = this.categoriesColors.map((cat) => { return cat.color; });

    const margin = {top: 0, right: 0, bottom: 44, left: 0},
      width = + this.svg.attr('width') - margin.left - margin.right,
      height = + this.svg.attr('height') - margin.top - margin.bottom;

    this.x = this.d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.05)
      .align(0.1);

    this.y = this.d3.scaleLinear()
      .rangeRound([height, 0]);

    this.svg.append('g')
      .attr('class', 'grid')
      .call(this.makeYGridlines()
          .tickSize(-width)
          .tickFormat(<any>''));

    const marginStackChart = { top: 20, right: 20, bottom: 30, left: 20 },
          widthStackChart = width - marginStackChart.left - marginStackChart.right,
          heightStackChart = height - marginStackChart.top - marginStackChart.bottom;

    const xStackChart = this.d3.scaleBand()
          .range([0, widthStackChart])
          .padding(0.1);
    const yStackChart = this.d3.scaleLinear()
              .range([heightStackChart, 0]);

    const colorStackChart = this.d3.scaleOrdinal(colors);

    const canvasStackChart = this.svg
      .attr('width', widthStackChart + marginStackChart.left + marginStackChart.right)
      .attr('height', heightStackChart + marginStackChart.top + marginStackChart.bottom)
      .append('g')
      .attr('transform', 'translate(' + marginStackChart.left + ',' + marginStackChart.top + ')');

    colorStackChart.domain(categories);

    const sortedData = [];
    for (const dat of this.dataFormatted) {
      if (!dat) {
        continue;
      }
      const arr = [];
      for (const cat of categories) {
        if (!dat[cat]) {
          continue;
        }
        arr.push({
          name: cat,
          value: this.hiddenCategories.indexOf(cat) !== -1 ? 0 : dat[cat]
        });
      }
      arr.sort(function(a, b) { return a.value - b.value; });
      sortedData.push(arr);
    }

    let index = 0;
    sortedData.forEach((d: any) => {
      let y0 = 0;
      d.ages = [];
      let max = 0;
      let sum = 0;
      for (const cat of d) {
        max = cat.value;
        d.ages.push({
          name: cat.name,
          range: this.formatAgeRangeLabel(this.dataFormatted[index].Label),
          hidden: this.hiddenRanges.indexOf(this.dataFormatted[index].Label) !== -1,
          y0: sum,
          y1: sum + max,
          actualValue: max,
          positionIndex: index
        });
        sum += max;
        y0 = max;
      }
      d.Label = this.dataFormatted[index].Label;
      index += 1;
      d.total = sum;
    });
    const maxValue = this.d3.max(sortedData, (d: any) => { return d.total; });
    xStackChart.domain(sortedData.map((d) => { return d.Label; }));

    yStackChart.domain([0, maxValue]);

    canvasStackChart.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + heightStackChart + ')')
      .call(this.d3.axisBottom(xStackChart));

    if (this.showYAxis) {
      const yAxisContainer = canvasStackChart.append('g')
        .attr('class', 'y axis');

      let yAxis;
      if (maxValue >= 1000000) {
        yAxis = yAxisContainer.call(this.d3.axisLeft(yStackChart).ticks(20, 's'));
      } else {
        yAxis = yAxisContainer.call(this.d3.axisLeft(yStackChart));
      }
      yAxis.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(this.totalLabel);
    }

    const state = canvasStackChart.selectAll('.Label')
      .data(sortedData)
      .enter().append('g')
      .attr('class', (d, i) => {
        return 'g';
      })
      .attr('transform', function (d) { return 'translate(' + xStackChart(d.Label) + ',0)'; });

    this.svg.selectAll('.x.axis .tick')
      .style('cursor', () => {
        if (this.filter) {
          return 'pointer';
        } else {
          return 'default'
        }
      })
      .attr('class', (d, i) => {
        if (this.hiddenRanges.indexOf(d.Label) !== -1) {
          return 'tick disabled';
        } else {
          return 'tick';
        }
      })
      .on('click', (d, i) => {
        if (this.filter) {
          this.hiddeRange(i);
        }
      });

    const self = this;
    this.svg.selectAll('.x.axis text').each(function(d, i) {
      const thisText = <any>this;
      if (self.hiddenRanges.indexOf(d) !== -1) {
        thisText.classList.add('disabled');
      } else {
        thisText.classList.remove('disabled');
      }
    });

    // Prep the tooltip, initial display is hidden
    if (!this.tooltip) {
      this.tooltip = this.d3.select(this.svgWrapper.nativeElement).append('div')
        .attr('class', 'd3tooltip')
        .style('opacity', 0);
    }

    const d3 = this.d3;
    const tooltip = this.tooltip;
    state.selectAll('rect')
      .data((d: any) => { return d.ages; })
      .enter().append('rect')
        .attr('width', xStackChart.bandwidth())
        .attr('style', () => {
          if (this.filter) {
            return 'cursor: pointer;';
          } else {
            return 'cursor: default;'
          }
        })
        .attr('y', (d: any) => { return yStackChart(d.y1); })
        .attr('class', (d: any) => {
          let className = d.name.toLowerCase();
          if (d.hidden) {
            className += ' hiddenBar';
          }
          return className;
        })
        .attr('rx', '2')
        .attr('height', (d: any) => { return yStackChart(d.y0) - yStackChart(d.y1); })
        .style('fill', (d: any) => {
          if (d.hidden) {
            return 'grey'; // TODO: make it dynamic -> Colors.colorN20;
          } else {
            return colorStackChart(d.name);
          }
        })
        .style('fill-opacity', (d: any) => {
          if (d.hidden) {
            return 0.5;
          } else {
            return 1;
          }
        })
      .on('mouseover', function(d) {
        if (d.hidden) {
          return;
        }
        tooltip.style('opacity', '1');
      })
      .on('mouseout', function() { tooltip.style('opacity', '0'); })
      .on('mousemove', function(d) {
        if (d.hidden) {
          return;
        }
        tooltip.transition()
          .duration(200)
          .style('opacity', 1);
        tooltip.html(`
          <span class="type">${d.name}</span> ${d.range}
          ${new FormatNumberPipe(self.translate).transform(d.actualValue, self.formatOptions)}${self.units}
        `);
      })
      .on('click', function(d) {
        if (self.filter) {
          self.hiddeRange(d.positionIndex);
        }
      });

      this.svg.on('mousemove', function(d) {
        const xPosition = d3.mouse(this)[0] + 10;
        const yPosition = d3.mouse(this)[1] - 10;

        tooltip.style('top', (d3.mouse(this)[1] + 10) + 'px')
          .style('left', (d3.mouse(this)[0] + 10) + 'px');

        const parentWidth = tooltip.node().parentElement.offsetWidth;
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipLeft = tooltip.node().offsetLeft;
        const dist = tooltipWidth + tooltipLeft;
        if (dist >= parentWidth) {
          const newLeftPosition = xPosition - (dist - parentWidth);
          tooltip.style('left', newLeftPosition + 'px').style('top', yPosition + 'px');
        } else {
          tooltip.style('left', xPosition + 'px').style('top', yPosition + 'px');
        }
      });
  }

  hiddeCategory(category) {
    if (!this.filter) {
      return;
    }
    if (this.hiddenCategories.indexOf(category) === -1) {
      this.hiddenCategories.push(category);
    } else {
      this.hiddenCategories.splice(this.hiddenCategories.indexOf(category), 1);
    }
    this.updateHiddenCategories.emit(this.hiddenCategories);
    this.fetch({bbox: this.getBBOX()});
  }

  hiddeRange(index) {
    for (const row in this.dataFormatted) {
      if (parseInt(row, 10) === index) {
        const range = this.dataFormatted[row].Label;

        if (this.hiddenRanges.indexOf(range) === -1) {
          this.hiddenRanges.push(range);
        } else {
          this.hiddenRanges.splice(this.hiddenRanges.indexOf(range), 1);
        }
      }
    }
    this.updateHiddenRanges.emit(this.hiddenRanges);
    this.fetch({bbox: this.getBBOX()});
  }

  getSquareStyle(color) {
    return {
      'width': '8px',
      'height': '8px',
      'margin-left': '4px',
      'border-radius': '2px',
      'display': 'inline-block',
      'background-color': color
    };
  }

  isStatusHidden(status) {
    return this.hiddenCategories.indexOf(status) !== -1;
  }

  private formatData(data) {
    const resp = [];
    for (let d of data) {
      let index = resp.findIndex((r) => { return r.Label == d['category_1']; });
      if (index !== -1) {
        resp[index][d.category_2] = d.value;
      } else {
        let row: any = {Label: d.category_1};
        row[d.category_2] = d.value;
        resp.push(row);
      }
    }

    return resp;
  }

  private setTranslations() {
    this.totalTranslationSubscription = this.translate.get('TOTAL', {}).subscribe((res: string) => {
      this.totalLabel = res;
    });
  }

  private formatAgeRangeLabel(label) {
    if (label.indexOf('>') !== -1) {
      label = label.replace('>', '&le;');
    } else if (label.indexOf('>') !== -1) {
      label = label.replace('>', '&ge;');
    } else if (label.indexOf('_') !== -1) {
      label = label.replace('_', '-');
    }

    return label;
  }

  private makeYGridlines() {
    return this.d3.axisLeft(this.y).ticks(4);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.totalTranslationSubscription) {
      this.totalTranslationSubscription.unsubscribe();
    }
  }

}
