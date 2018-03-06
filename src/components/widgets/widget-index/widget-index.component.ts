
import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { D3Service, D3 } from 'd3-ng2-service';

@Component({
  selector: 'latitude-widget-index',
  templateUrl: './widget-index.component.html',
  styleUrls: ['./widget-index.component.scss']
})
export class WidgetIndexComponent implements OnInit {
  @ViewChild('svgWrapper') svgWrapper;

  @Input() width: number = 300;
  @Input() height: number = 300;
  @Input() color = '#0066CC';
  @Input() readOnly = false;
  @Output() indexChanged: EventEmitter<any> = new EventEmitter<any>();

  private _indexes: any;
  @Input('indexes')
  set indexes(value) {
    this._indexes = value;
  };

  points;
  limitPoints;
  gridPoints;
  handlers = [];
  draggingPoint: any;
  paths = [];
  pointPositions = [];

  private d3: D3;
  private resizePointHandlerSize = 12;
  private svg: any;
  private newg: any;
  private draggablePolygon: any;

  constructor(d3Service: D3Service) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
    if (this.readOnly) {
      this.resizePointHandlerSize = 0;
    }

    this.points = this.polygon(this.width / 2 + (this.resizePointHandlerSize / 2), this.width / 2 + (this.resizePointHandlerSize / 2), this.width / 2 - (this.resizePointHandlerSize / 2), 3);
    const limitPoints = this.polygon(this.width / 2 + (this.resizePointHandlerSize / 2), this.width / 2 + (this.resizePointHandlerSize / 2), ((this.width / 2 - (this.resizePointHandlerSize / 2)) / 10), 3);
    this.limitPoints = limitPoints;

    let steps = ((this.width / 2 - (this.resizePointHandlerSize / 2)) / 10);
    this.gridPoints = [];
    for (var i = 0; i < 11; i++) {
      const smallest = this.polygon(this.width / 2 + (this.resizePointHandlerSize / 2), this.width / 2 + (this.resizePointHandlerSize / 2), steps * i, this._indexes.length);
      this.gridPoints.push(smallest);
    }
    this.setDefaultValues();
    this.setDragPoints();
    this.drawRegularPolygon();
  }

  private drawRegularPolygon(reset = false) {
    if (reset) {
      this.d3.select(this.svgWrapper.nativeElement).selectAll("*").remove();
    }

    this.svg = this.d3.select(this.svgWrapper.nativeElement).append('svg')
      .attr('width', this.width + (this.resizePointHandlerSize * 2))
      .attr('height', this.height + (this.resizePointHandlerSize * 2));

    this.paths = [];
    for (let lineIndex in this.limitPoints) {
      this.paths.push(this.svg.append('path')
        .attr('d', this.lineFunction(lineIndex))
        .attr('stroke', 'none')
        .attr('stroke-width', 1)
        .attr('fill', 'none'));
    }

    // Append a polygon (rhombus)
    this.newg = this.svg.append('g');
    this.newg.append('polygon')
      .attr('points', `${this.points}`)
      .attr('fill-opacity', 0)
      .attr('stroke', '#9397A2') // TODO: color
      .attr('stroke-width', 2);

    // Draw polygon (rhombus) grid
    const lines = this.readOnly ? 4 : 5;
    const step = ((this.width / 2 - (this.resizePointHandlerSize / 2)) / 5);
    for (var i = 1; i < lines; i++) {
      const points = this.polygon(this.width / 2 + (this.resizePointHandlerSize / 2), this.width / 2 + (this.resizePointHandlerSize / 2), step * i, this._indexes.length);
      this.newg.append('polygon')
          .attr('points', `${points}`)
          .attr('fill-opacity', 0)
          .attr('stroke', '#9397A2') // TODO: color
          .attr('stroke-width', 1)
          .attr('stroke-opacity', .2);
    }

    // Set the gradient wihtin a mask
    const defs = this.newg.append('defs');
    const mask = defs.append('mask').attr('id', 'masking');
    const gradient = defs.append('radialGradient').attr('id', 'gradientPolygon').attr('gradientUnits', "userSpaceOnUse");
    gradient.append('stop').attr('offset', '0%').attr('stop-opacity', .1).attr('stop-color', 'white');
    gradient.append('stop').attr('offset', '100%').attr('stop-opacity', 1).attr('stop-color', this.color);

    // Append a polygon to the mask, this will be the one that gets the previously created gradient
    mask.append('polygon')
      .attr('points', `${this.points}`)
      .attr('fill-opacity', () => {
        if (this.readOnly) {
          return '0.9';
        } else {
          return '1';
        }
      })
      .attr('fill', () => {
        if (this.readOnly) {
          return this.color;
        } else {
          return "url(#gradientPolygon)";
        }
      });

    // Let's create the polygon (rhombus) that we will actually be dragging, it has the previously created mask
    this.draggablePolygon = this.newg.append('polygon')
      .attr('points', `${this.pointPositions}`)
      .attr('fill', this.color)
      .attr('mask', 'url(#masking)');

    // Let's call the method that will drag the circles that will be used to drag the indexes
    this.setHandlers();
  }

  private polygon(x, y, radius, sides) {
    let crd = [];
    if (sides == 1) {
      return [[x, y]];
    }
    for (let i = 0; i < sides; i++) {
      crd.push([(x + (Math.sin(2 * Math.PI * i / sides) * radius)), (y - (Math.cos(2 * Math.PI * i / sides) * radius))]);
    }
    return crd;
	}

  private lineFunction(index) {
    let line = [];
    line.push({'x': this.limitPoints[index][0], 'y': this.limitPoints[index][1]});
    line.push({'x': this.points[index][0], 'y': this.points[index][1]});
    var linearFunc = this.d3.line().x(function(d: any) { return d.x; }).y(function(d: any) { return d.y; });

    return linearFunc(line);
  }

  private translateAlong(path) {
    var l = path.getTotalLength();
    return function(d, i, a) {
      return function(t) {
        var p = path.getPointAtLength(t * l);
        return "translate(" + p.x + "," + p.y + ")";
      };
    };
  }

  private closestPoint(pathNode, point) {
    var pathLength = pathNode.getTotalLength(),
        precision = 8,
        best,
        bestLength,
        bestDistance = Infinity;
    // linear scan for coarse approximation
    for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
      if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
        best = scan, bestLength = scanLength, bestDistance = scanDistance;
      }
    }
    // binary search for precise estimate
    precision /= 2;
    while (precision > 0.5) {
      var before,
          after,
          beforeLength,
          afterLength,
          beforeDistance,
          afterDistance;
      if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
        best = before, bestLength = beforeLength, bestDistance = beforeDistance;
      } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
        best = after, bestLength = afterLength, bestDistance = afterDistance;
      } else {
        precision /= 2;
      }
    }

    best = [best.x, best.y];
    best.distance = Math.sqrt(bestDistance);
    return best;

    function distance2(p) {
      var dx = p.x - point[0],
          dy = p.y - point[1];
      return dx * dx + dy * dy;
    }
  }

  // Dragging events for each pointHandler
  private setDragPoints() {
    const self = this;
    let points = this.pointPositions;
    this.draggingPoint = [];
    for (let point of this.points) {
      this.draggingPoint.push(this.d3.drag().on('drag', (d: any) => {
        var m = self.d3.mouse(self.handlers[d.pointNumber].node());
        var p = self.closestPoint(self.paths[d.pointNumber].node(), m);
        self.handlers[d.pointNumber].attr('x', p[0] - (this.resizePointHandlerSize / 2)).attr('y', p[1] - (this.resizePointHandlerSize / 2));
        points[d.pointNumber][0] = p[0];
        points[d.pointNumber][1] = p[1];
        self.draggablePolygon.attr('points', `${points}`);
      }).on('end', (d: any) => {
        let current = self.handlers[d.pointNumber].attr('x');
        let arr = self.gridPoints.map(p => p[d.pointNumber][0]);
        if (parseFloat(current) === d.x) {
          current = self.handlers[d.pointNumber].attr('y');
          arr = self.gridPoints.map(p => p[d.pointNumber][1]);
        }
        let closest: any, index: any;
        if (arr[0] < arr[arr.length - 1]) {
          closest = Math.max.apply(null, arr.filter((v) => { return v <= parseFloat(current)}));
          if (closest === -Infinity) {
            closest = Math.min.apply(null, arr.filter((v) => { return v >= parseFloat(current)}));
          }
          index = arr.findIndex((p) => {
            return p === closest;
          });
          index += 1;
        } else {
          closest = Math.max.apply(null, arr);
          for (var i = 0; i < arr.length; i++) {
            if(arr[i] >= parseFloat(current) && arr[i] < closest) closest = arr[i]; //Check if it's higher than your number, but lower than your closest value
          }
          index = arr.findIndex((p) => {
            return p === closest;
          });
        }
        self.indexChanged.emit({index: d.pointNumber + 1, step: index});
      }));
    }
  }

  // Check if the are some defined values, in that case we need to recalculate the point positions
  private setDefaultValues() {
    let count = 0;
    for (let point of this.points) {
      let x = point[0];
      let y = point[1];
      if (this._indexes[count] && this._indexes[count].value) {
        const b = this.gridPoints[this._indexes[count].value];
        x = b[count][0];
        y = b[count][1];
      }
      this.pointPositions.push([x, y]);
      count += 1;
    }
  }

  // Draw the circles handlers that will be used to drag the indexes
  private setHandlers() {
    if (this.readOnly) { return; };
    this.handlers = [];
    let count = 0;
    for (let coordIndex in this.pointPositions) {
      this.handlers.push(this.newg.append('rect')
        .attr('x', this.pointPositions[coordIndex][0] - (this.resizePointHandlerSize / 2))
        .attr('y', this.pointPositions[coordIndex][1] - (this.resizePointHandlerSize / 2))
        .attr('height', this.resizePointHandlerSize)
        .attr('width', this.resizePointHandlerSize)
        .attr('fill', '#EAC349') // TODO: color
        .attr('fill-opacity', .9)
        .attr('stroke-width', 2)
        .attr('stroke', 'white')
        .attr('stroke-opacity', 1)
        .attr('ry', this.resizePointHandlerSize)
        .attr('rx', this.resizePointHandlerSize)
        .attr('cursor', 'move')
        .data([{pointNumber: count, x: this.pointPositions[coordIndex][0]  - (this.resizePointHandlerSize / 2), y: this.pointPositions[coordIndex][1]  - (this.resizePointHandlerSize / 2)}])
        .call(this.draggingPoint[count]))
        count += 1;
    }
  }

}
