import { Component, OnInit, OnDestroy, EventEmitter, Input, Output, OnChanges, ViewChild } from '@angular/core';
// import { Colors } from '../../../common/cons';
import { DataSourceHistogram } from '../../../utils/data-source.histogram';
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs/Subscription';

import * as moment from 'moment/moment';

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
export class WidgetStackedBarsComponent implements OnInit, OnDestroy, OnChanges {

  private d3: D3;

  svg: any;
  x: any;
  y: any;
  z: any;
  tooltip: any;

  totalTranslationSubscription: Subscription;
  totalLabel: String;

  hiddenCategories = [];
  hiddenRanges = [];

  @ViewChild('svgContainer') svgContainer;
  @ViewChild('svgWrapper') svgWrapper;

  @Input() title: string;

  @Input() data: any;
  @Input() dataSource: DataSourceHistogram;
  @Input() showYAxis = true;

  @Input() src: string;
  @Input() categoriesColors: Array<any>;

  @Input() units = '';
  @Input() loading = false;
  @Input() filter = true;

  @Output() toggleLayer = new EventEmitter<any>(null);
  @Output() updatedData = new EventEmitter<any>(null);

  @Output() updateHiddenRanges = new EventEmitter<any>(null);
  @Output() updateHiddenCategories = new EventEmitter<any>(null);

  searchingColor = 'red'; /// TODO: make it dynamic -> Colors.colorPrimary;

  constructor(
    d3Service: D3Service,
    private translate: TranslateService,
  ) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
    this.setTranslations();
    this.svg = this.d3.select(this.svgContainer.nativeElement);
    this.dataSource.fetch().then((data) => {
      this.data = data;
      this.refresh();
    });
  }

  ngOnChanges(change: any) {
    if (change.data && change.data.currentValue !== undefined) {
      this.refresh();
    }
  }

  private setTranslations() {
    this.totalTranslationSubscription = this.translate.get('TOTAL', {}).subscribe((res: string) => {
      this.totalLabel = res;
    });
  }

  refresh() {
    if ((!this.data || this.data.length === 0) && this.svg) {
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
    for (const data of this.data) {
      if (!data) {
        continue;
      }
      const arr = [];
      for (const cat of categories) {
        if (!data[cat]) {
          continue;
        }
        arr.push({
          name: cat,
          value: this.hiddenCategories.indexOf(cat) !== -1 ? 0 : data[cat]
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
          range: this.formatAgeRangeLabel(this.data[index].Label),
          hidden: this.hiddenRanges.indexOf(this.data[index].Label) !== -1,
          y0: sum,
          y1: sum + max,
          actualValue: max,
          positionIndex: index
        });
        sum += max;
        y0 = max;
      }
      d.Label = this.data[index].Label;
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
      .style('cursor', 'pointer')
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
        .attr('style', 'cursor: pointer;')
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
        const yPosition = d3.event.layerY - 26;
        const xPosition = d3.event.layerX + 8;

        tooltip.transition()
          .duration(200)
          .style('opacity', 1);

        tooltip.html('<span class="type">' + d.name + '</span>' + d.range + ': ' + d.actualValue.toLocaleString());
        tooltip.style('top', (d3.event.layerY + 10) + 'px')
          .style('left', (d3.event.layerX + 10) + 'px');

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
      })
      .on('click', function(d) {
        if (self.filter) {
          self.hiddeRange(d.positionIndex);
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
    this.refresh();
  }

  hiddeRange(index) {
    for (const row in this.data) {
      if (parseInt(row, 10) === index) {
        const range = this.data[row].Label;

        if (this.hiddenRanges.indexOf(range) === -1) {
          this.hiddenRanges.push(range);
        } else {
          this.hiddenRanges.splice(this.hiddenRanges.indexOf(range), 1);
        }
      }
    }

    this.updateHiddenRanges.emit(this.hiddenRanges);
    this.refresh();
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

  toggleLayerEvent(event) {
    this.toggleLayer.emit(event);
  }

  isStatusHidden(status) {
    return this.hiddenCategories.indexOf(status) !== -1;
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
    if (this.totalTranslationSubscription) {
      this.totalTranslationSubscription.unsubscribe();
    }
  }

}
