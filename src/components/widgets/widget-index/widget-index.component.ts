
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ViewChild } from '@angular/core';
import { D3Service, D3 } from 'd3-ng2-service';

@Component({
  selector: 'latitude-widget-index',
  templateUrl: './widget-index.component.html',
  styleUrls: ['./widget-index.component.scss']
})
export class WidgetIndexComponent implements OnInit, OnChanges {
  @ViewChild('svgWrapper') svgWrapper;
  @Input() defaultValues: any = false;
  @Input() width: number = 300;
  @Input() height: number = 300;
  @Input() color = '#0066CC';
  @Input() readOnly = false;
  @Output() indexChanged: EventEmitter<any> = new EventEmitter<any>();

  points;
  minPoints;

  private d3: D3;
  private resizePointHandlerSize = 12;
  private min = (this.width / 2) - this.resizePointHandlerSize;
  private step = this.min / 10;
  private startMin = this.step * 5;
  private pointPositions = {
    one: this.startMin - 0,
    two: this.width - this.startMin,
    three: this.width - this.startMin,
    four: this.startMin - 0
  };

  private svg: any;
  private newg: any;
  private draggablePolygon: any;

  private dragPointOne: any;
  private dragPointTwo: any;
  private dragPointThree: any;
  private dragPointFour: any;
  private handlerPointOne: any;
  private handlerPointTwo: any;
  private handlerPointThree: any;
  private handlerPointFour: any;

  constructor(d3Service: D3Service) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
    if (this.width !== 300 || this.height !== 300) {
      this.recalculationDueCustomSizes();
    }
    this.setDragPoints();
    this.drawRhombus();
  }

  private recalculationDueCustomSizes() {
    this.min = (this.width / 2) - this.resizePointHandlerSize;
    this.step = this.min / 10;
    this.startMin = this.step * 5;
    this.pointPositions = {
      one: this.startMin - 0,
      two: this.width - this.startMin,
      three: this.width - this.startMin,
      four: this.startMin - 0
    };
  }

  ngOnChanges(changes) {
    if (changes.defaultValues && !changes.defaultValues.firstChange) {
      this.drawRhombus(true);
    }
  }

  polygon(x, y, radius, sides) {
		var crd = [];

		/* 1 SIDE CASE */
		if (sides == 1)
		return [[x, y]];

		/* > 1 SIDE CASEs */
		for (var i = 0; i < sides; i++) {
			crd.push([(x + (Math.sin(2 * Math.PI * i / sides) * radius)), (y - (Math.cos(2 * Math.PI * i / sides) * radius))]);
		}
		return crd;
	}

  calculateWaypoints(points) {
    let yOptions = points.map(p => p[1]);
    let xOptions = points.map(p => p[0]);
    let xMax = Math.max(...xOptions);
    let yMax = Math.max(...yOptions);
    let xMin = Math.min(...xOptions);
    let yMin = Math.min(...yOptions);
    this.minPoints = points;
    // let yOptions = this.points.map(p => p[1]);
    // let xOptions = this.points.map(p => p[0]);
    // let xMax = Math.max(...xOptions);
    // let yMax = Math.max(...yOptions);
    // let xMin = Math.min(...xOptions);
    // let yMin = Math.min(...yOptions);
    // let pointsWayToCenter = [];
    //
    // let xStep = xMax / 10;
    // let yStep = yMax / 10;
    // for (let point of this.points) {
    //
    //   let x;
    //   if (point[0] === (xMax / 2)) {
    //     x = false;
    //   } else if (point[0] > (xMax / 2)) {
    //     x = 1;
    //   } else if (point[0] < (xMax / 2)) {
    //     x = -1;
    //   }
    //   let y;
    //   if (point[1] === (yMax / 2)) {
    //     y = false;
    //   } else if (point[0] > (xMax / 2)) {
    //     x = 1;
    //   } else if (point[0] < (xMax / 2)) {
    //     x = -1;
    //   }
    //
    //   for (var i = 0; i < 10; i++) {
    //
    //   }
    // }
  }

  private lineFunction(index) {
    let line = [];
    line.push({'x': this.minPoints[index][0], 'y': this.minPoints[index][1]});
    line.push({'x': this.points[index][0], 'y': this.points[index][1]});
    var linearFunc = this.d3.line().x(function(d: any) { return d.x; }).y(function(d: any) { return d.y; });

    return linearFunc(line);
  }

  private drawRhombus(reset = false) {
    if (reset) {
      this.d3.select(this.svgWrapper.nativeElement).selectAll("*").remove();
    }

    // Append an svg with the width and height, add padding based on the pointHandlerSize.
    this.svg = this.d3.select(this.svgWrapper.nativeElement).append('svg')
      .attr('width', this.width + (this.resizePointHandlerSize * 2))
      .attr('height', this.height + (this.resizePointHandlerSize * 2));


    console.log(this.width / 2 - this.resizePointHandlerSize);
    let points = this.polygon(162, 162, 162, 11);
    this.points = this.polygon(162, 162, 162, 11);
    let minPoints = this.polygon(162, 162, 16.2, 11);
    this.calculateWaypoints(minPoints);
    console.log(this.points);
    console.log(this.minPoints);

    for (let lineIndex in this.minPoints) {
      this.svg.append('path')
        .attr('d', this.lineFunction(lineIndex))
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    }

    // Append a polygon (rhombus)
    this.newg = this.svg.append('g');
    this.newg.append('polygon')
      .attr('points', `${points}`)
      .attr('fill-opacity', 0)
      .attr('stroke', '#9397A2') // TODO: color
      .attr('stroke-width', 2);

    // Draw polygon (rhombus) grid
    const lines = this.readOnly ? 3 : 5;
    const stepAlt = this.readOnly ? this.step * 2 : this.step;
    // for (var i = 1; i < lines; i++) {
    //   this.newg.append('polygon')
    //       .attr('points', `${(this.width / 2) + this.resizePointHandlerSize}, ${((stepAlt * 2) * i) + this.resizePointHandlerSize} ${(this.width - ((stepAlt * 2) * i)) + this.resizePointHandlerSize}, ${(this.width / 2) + this.resizePointHandlerSize}, ${(this.width / 2) + this.resizePointHandlerSize}, ${(this.width - ((stepAlt * 2) * i)) + this.resizePointHandlerSize}, ${((stepAlt * 2) * i) + this.resizePointHandlerSize} ${(this.width / 2) + this.resizePointHandlerSize}`)
    //       .attr('fill-opacity', 0)
    //       .attr('stroke', '#9397A2') // TODO: color
    //       .attr('stroke-width', 1)
    //       .attr('stroke-opacity', .2);
    // }
    this.setDefaultValues();

    // Set the gradient wihtin a mask
    const defs = this.newg.append('defs');
    const mask = defs.append('mask').attr('id', 'masking');
    const gradient = defs.append('radialGradient').attr('id', 'gradientPolygon').attr('gradientUnits', "userSpaceOnUse");
    gradient.append('stop').attr('offset', '0%').attr('stop-opacity', .1).attr('stop-color', 'white');
    gradient.append('stop').attr('offset', '100%').attr('stop-opacity', 1).attr('stop-color', this.color); // TODO: color to be received by input or this one by default
    // Append a polygon to the mask, this will be the one that gets the previously created gradient
    mask.append('polygon')
      .attr('points', `${points}`) // (this.width/ 2) + this.resizePointHandlerSize}, ${this.resizePointHandlerSize} ${this.width + this.resizePointHandlerSize}, ${(this.width/ 2) + this.resizePointHandlerSize}, ${(this.width/ 2) + this.resizePointHandlerSize}, ${this.width + this.resizePointHandlerSize}, ${0 + this.resizePointHandlerSize} ${(this.width/ 2) + this.resizePointHandlerSize}`)
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
      .attr('points', `${points}`) // ${this.width / 2 + this.resizePointHandlerSize}, ${this.pointPositions.one} ${this.pointPositions.two}, ${this.width / 2 + this.resizePointHandlerSize}, ${this.width / 2 + this.resizePointHandlerSize}, ${this.pointPositions.three}, ${this.pointPositions.four} ${this.width / 2 + this.resizePointHandlerSize}`)
      .attr('fill', this.color) // TODO: color
      .attr('mask', 'url(#masking)');

    // Let's call the method that will drag the circles that will be used to drag the indexes
    // this.setHandlers();
  }

  // Dragging events for each pointHandler
  private setDragPoints() {
    const self = this;
    let points = this.points; // this.polygon(this.width / 2, this.height / 2, this.width / 2 - this.resizePointHandlerSize, 3);

    this.dragPointOne = this.d3.drag()
      .on('drag', (d: any) => {
        let x: any = false;
        if (self.points[0][0] > self.minPoints[0][0]) {
          x = -1;
        } else if (self.points[0][0] < self.minPoints[0][0]) {
          x = 1;
        }
        if (x === -1) {
          if (d.x <= self.minPoints[0][0]) {
            console.log('---- x reached');
            return;
          }
        } else if (x === 1) {
          if (d.x >= self.minPoints[0][0]) {
            console.log('---- x reached');
            return;
          }
        }
        let y: any = false;
        if (self.points[0][1] > self.minPoints[0][1]) {
          y = -1;
        } else if (self.points[0][1] < self.minPoints[0][1]) {
          y = 1;
        }
        if (y === -1) {
          if (d.y <= self.minPoints[0][1] && self.d3.event.dy < 0) {
            console.log('---- y reached', self.d3.event.dy);
            return;
          }
        } else if (y === 1) {
          // Working case (tested in point 1)
          if (d.y >= self.minPoints[0][1] && self.d3.event.dy > 0) {
            console.log('---- y max reached');
            return;
          } else if (d.y <= 0 && self.d3.event.dy <= 0) {
            console.log('---- y min reached');
            return;
          }
        }
        if (x === -1) {
          d.x = d.x + (self.d3.event.dx * -1);
        } else if (x === 1) {
          d.x = d.x + self.d3.event.dx;
        }

        if (y === -1) {
          d.y = d.y + (self.d3.event.dy * -1);
        } else if (y === 1) {
          d.y = d.y + self.d3.event.dy;
        }
        self.handlerPointOne
          .attr('x', (d) => { return d.x; })
          .attr('y', (d) => { return d.y; });
      })
      .on('end', (d: any) => {
        // this.calculateStep(d.y, 1, 1);
      });

    // console.log(points[1]);
    // let pointsMins = this.polygon(this.width / 2, this.height / 2, 10, 3);
    this.dragPointTwo = this.d3.drag().on('drag', (d: any) => {
      let x: any = false;
      if (self.points[1][0] > self.minPoints[1][0]) {
        x = -1;
      } else if (self.points[1][0] < self.minPoints[1][0]) {
        x = 1;
      }
      if (x === -1) {
        // console.log('---- dx', d.x);
        // console.log('---- self.minPoints[1][0]', self.minPoints[1][0]);
        console.log('---- self.d3.event.dx', self.d3.event.dx);
        if (d.x <= self.minPoints[1][0]) {
          console.log('---- x reached');
          return;
        }
      } else if (x === 1) {
        if (d.x >= self.minPoints[1][0]) {
          console.log('---- x reached');
          return;
        }
      }
      let y: any = false;
      if (self.points[1][1] > self.minPoints[1][1]) {
        y = -1;
      } else if (self.points[1][1] < self.minPoints[1][1]) {
        y = 1;
      }
      if (y === -1) {
        // console.log('---- dy', d.y);
        // console.log('---- self.minPoints[1][1]', self.minPoints[1][1]);
        console.log('---- self.d3.event.dy', self.d3.event.dy);
        if (d.y <= self.minPoints[1][1] && self.d3.event.dy < 0) {
          console.log('---- y reached', self.d3.event.dy);
          return;
        }
      } else if (y === 1) {
        // Working case (tested in point 1)
        if (d.y >= self.minPoints[1][1] && self.d3.event.dy > 0) {
          console.log('---- y max reached');
          return;
        } else if (d.y <= 0 && self.d3.event.dy <= 0) {
          console.log('---- y min reached');
          return;
        }
      }
      if (x === -1) {
        let mover = self.d3.event.dx;
        if (self.d3.event.dx < self.d3.event.dy) {
          mover = self.d3.event.dy;
        }
        d.x = d.x + mover;
      } else if (x === 1) {
        d.x = d.x + self.d3.event.dx;
      }

      if (y === -1) {
        let mover = self.d3.event.dx;
        if (self.d3.event.dx < self.d3.event.dy) {
          mover = self.d3.event.dy;
        }
        d.y = d.y + mover;
      } else if (y === 1) {
        d.y = d.y + self.d3.event.dx;
      }

      self.handlerPointTwo
        .attr('x', (d) => { return d.x; })
        .attr('y', (d) => { return d.y; });
      // // if ((d.x + self.d3.event.dx) <= ((self.width + (self.resizePointHandlerSize * 2)) / 2) + (self.resizePointHandlerSize / 2)) { // self.resizePointHandlerSize * 3 because left and right margin
      // //   return;
      // // } else if ((d.x + self.d3.event.dx) >= (self.width + 1) + self.resizePointHandlerSize) {
      // //   return;
      // // }
      // // if (d.x < pointsMins[1][0] || d.y < pointsMins[1][1]) {
      // //   console.log('xxxx', pointsMins[1]);
      // //   console.log('yyyy', d);
      // //   return;
      // // }
      // console.log('d.x', d.x);
      // console.log('d.y', d);
      // console.log('self.d3.event.dx', self.d3.event.dx);
      // console.log('self.d3.event.dy', self.d3.event.dy);
      // d.x = d.x + self.d3.event.dx;
      // d.y = d.y + self.d3.event.dx;
      // console.log('two.event.x', self.d3.event.x);
      // console.log('two.event.y', self.d3.event.y);
      // // self.pointPositions.two = d.x;
      //
      // self.draggablePolygon.attr('points', `${points}`);
      // // self.draggablePolygon.attr('points', `${(self.width / 2) + self.resizePointHandlerSize}, ${self.pointPositions.one} ${self.pointPositions.two}, ${(self.width / 2) + self.resizePointHandlerSize}, ${(self.width / 2) + self.resizePointHandlerSize}, ${self.pointPositions.three}, ${self.pointPositions.four} ${(self.width / 2) + self.resizePointHandlerSize}`);
      // self.handlerPointTwo
      //   .attr('x', (d) => { return d.x - (self.resizePointHandlerSize/2) })
      //   .attr('y', (d) => { return d.y + (self.resizePointHandlerSize/2) });
    })
    .on('end', (d: any) => {
      // this.calculateStep(d.x, 2, 2);
    });

    this.dragPointThree = this.d3.drag().on('drag', (d: any) => {
      let x: any = false;
      if (self.points[2][0] > self.minPoints[2][0]) {
        x = -1;
      } else if (self.points[2][0] < self.minPoints[2][0]) {
        x = 1;
      }
      if (x === -1) {
        if (d.x <= self.minPoints[2][0]) {
          console.log('---- x reached');
          return;
        }
      } else if (x === 1) {
        if (d.x >= self.minPoints[2][0]) {
          console.log('---- x reached');
          return;
        }
      }
      let y: any = false;
      if (self.points[2][1] > self.minPoints[2][1]) {
        y = -1;
      } else if (self.points[2][1] < self.minPoints[2][1]) {
        y = 1;
      }
      if (y === -1) {
        if (d.y <= self.minPoints[2][1] && self.d3.event.dy < 0) {
          console.log('---- y reached', self.d3.event.dy);
          return;
        }
      } else if (y === 1) {
        // Working case (tested in point 1)
        if (d.y >= self.minPoints[2][1] && self.d3.event.dy > 0) {
          console.log('---- y max reached');
          return;
        } else if (d.y <= 0 && self.d3.event.dy <= 0) {
          console.log('---- y min reached');
          return;
        }
      }
      if (x === -1) {
        d.x = d.x + (self.d3.event.dx * -1);
      } else if (x === 1) {
        d.x = d.x + self.d3.event.dx;
      }

      if (y === -1) {
        d.y = d.y + (self.d3.event.dx * -1);
      } else if (y === 1) {
        d.y = d.y + self.d3.event.dx;
      }

      self.handlerPointThree
        .attr('x', (d) => { return d.x; })
        .attr('y', (d) => { return d.y; });// // if ((d.y + self.d3.event.dy) <= ((self.width + (self.resizePointHandlerSize * 2)) / 2) + (self.resizePointHandlerSize / 2)) { // self.resizePointHandlerSize * 3 because left and right margin
       // //   return;
       // // } else if ((d.y + self.d3.event.dy) >= (self.width + 1) + self.resizePointHandlerSize) {
       // //   return;
       // // }
       // console.log('three', self.d3.event.dx);
       // d.x = d.x + (self.d3.event.dx);
       // d.y = d.y +(self.d3.event.dx * -1)
       //
       // // d.y = d.y + self.d3.event.dy;
       // // self.pointPositions.three = d.y;
       // // self.draggablePolygon.attr('points', `${(self.width / 2) + self.resizePointHandlerSize}, ${self.pointPositions.one} ${self.pointPositions.two}, ${(self.width / 2) + self.resizePointHandlerSize}, ${(self.width / 2) + self.resizePointHandlerSize}, ${self.pointPositions.three}, ${self.pointPositions.four} ${(self.width / 2) + self.resizePointHandlerSize}`);
       // self.handlerPointThree
       //   .attr('x', (d) => { return d.x + (self.resizePointHandlerSize/2) })
       //   .attr('y', (d) => { return d.y - (self.resizePointHandlerSize/2) });
    })
    .on('end', (d: any) => {
      // this.calculateStep(d.y, 2, 3);
    });

    this.dragPointFour = this.d3.drag().on('drag', (d: any) => {
      if ((d.x + self.d3.event.dx) >= (self.width / 2) - self.resizePointHandlerSize) {
        return;
      } else if ((d.x + self.d3.event.dx) <= 0) {
        return;
      }
      d.x = d.x + self.d3.event.dx;
      self.pointPositions.four = d.x;
      self.draggablePolygon.attr('points', `${(self.width / 2) + self.resizePointHandlerSize}, ${self.pointPositions.one} ${self.pointPositions.two}, ${(self.width / 2) + self.resizePointHandlerSize}, ${(self.width / 2) + self.resizePointHandlerSize}, ${self.pointPositions.three}, ${self.pointPositions.four} ${(self.width / 2) + self.resizePointHandlerSize}`);
      self.handlerPointFour
        .attr('x', (d) => { return d.x - (self.resizePointHandlerSize/2) });
    })
    .on('end', (d: any) => {
      this.calculateStep(d.x, 1, 4);
    });
  }

  // Check if the are some defined values, in that case we need to recalculate the point positions
  private setDefaultValues() {
    if (this.defaultValues) {
      if (this.defaultValues.one !== undefined && this.defaultValues.one >= 0 && this.defaultValues.one <= 10) {
        this.pointPositions.one = (this.width / 2) - (this.step * (this.defaultValues.one + 1)) + this.resizePointHandlerSize;
      }
      if (this.defaultValues.two !== undefined && this.defaultValues.two >= 0 && this.defaultValues.two <= 10) {
        this.pointPositions.two = (this.step * (this.defaultValues.two + 1)) + (this.width / 2) + this.resizePointHandlerSize;
      }
      if (this.defaultValues.three !== undefined && this.defaultValues.three >= 0 && this.defaultValues.three <= 10) {
        this.pointPositions.three = (this.step * (this.defaultValues.three + 1)) + (this.width / 2) + this.resizePointHandlerSize;
      }
      if (this.defaultValues.four !== undefined && this.defaultValues.four >= 0 && this.defaultValues.four <= 10) {
        this.pointPositions.four = (this.width / 2) -  (this.step * (this.defaultValues.four + 1)) + this.resizePointHandlerSize;
      }
    }
  }

  // Drag the circles handlers that will be used to drag the indexes
  private setHandlers() {
    if (this.readOnly) { return; };
    let test = this.polygon(this.width / 2, this.height / 2, this.width / 2 - this.resizePointHandlerSize, 3);
    this.handlerPointOne = this.newg.append('rect')
      .attr('x', test[0][0])
      .attr('y', test[0][1])
      .attr('height', this.resizePointHandlerSize)
      .attr('width', this.resizePointHandlerSize)
      .attr('id', 'dragtop')
      .attr('fill', '#EAC349') // TODO: color
      .attr('fill-opacity', .9)
      .attr('stroke-width', 2)
      .attr('stroke', 'white')
      .attr('stroke-opacity', 1)
      .attr('ry', this.resizePointHandlerSize)
      .attr('rx', this.resizePointHandlerSize)
      .attr('cursor', 'ns-resize')
      .data([{x: (this.width / 2) - (this.resizePointHandlerSize / 2) + this.resizePointHandlerSize, y: this.pointPositions.one - (this.resizePointHandlerSize / 2)}])
      .call(this.dragPointOne);

    this.handlerPointTwo = this.newg.append('rect')
      .attr('x', test[1][0]) // (d) => { return this.pointPositions.two - (this.resizePointHandlerSize / 2); })
      .attr('y', test[1][1]) // (d) => { return (this.width / 2) - (this.resizePointHandlerSize / 2) + this.resizePointHandlerSize; })
      .attr('height', this.resizePointHandlerSize)
      .attr('width', this.resizePointHandlerSize)
      .attr('id', 'dragright')
      .attr('fill', '#094FA4') // TODO: color
      .attr('fill-opacity', .9)
      .attr('stroke-width', 2)
      .attr('stroke', 'white')
      .attr('stroke-opacity', 1)
      .attr('ry', this.resizePointHandlerSize)
      .attr('rx', this.resizePointHandlerSize)
      .attr('cursor', 'ew-resize')
      .data([{x: test[1][0], y: test[1][1]}])
      .call(this.dragPointTwo);

    this.handlerPointThree = this.newg.append('rect')
      .attr('x', test[2][0]) // (d) => { return (this.width / 2) - (this.resizePointHandlerSize / 2) + this.resizePointHandlerSize; })
      .attr('y', test[2][1]) // (d) => { return this.pointPositions.three - (this.resizePointHandlerSize / 2); })
      .attr('height', this.resizePointHandlerSize)
      .attr('width', this.resizePointHandlerSize)
      .attr('id', 'dragbottom')
      .attr('fill', '#F24440') // TODO: color
      .attr('fill-opacity', .9)
      .attr('stroke-width', 2)
      .attr('stroke', 'white')
      .attr('stroke-opacity', 1)
      .attr('ry', this.resizePointHandlerSize)
      .attr('rx', this.resizePointHandlerSize)
      .attr('cursor', 'ns-resize')
      .data([{x: test[2][0], y: test[2][1]}])
      .call(this.dragPointThree);
    //
    // this.handlerPointFour = this.newg.append('rect')
    //   .attr('x', (d) => { return this.pointPositions.four - (this.resizePointHandlerSize / 2); })
    //   .attr('y', (d) => { return (this.width / 2) - (this.resizePointHandlerSize / 2) + this.resizePointHandlerSize; })
    //   .attr('height', this.resizePointHandlerSize)
    //   .attr('width', this.resizePointHandlerSize)
    //   .attr('id', 'dragleft')
    //   .attr('fill', '#B24DAE') // TODO: color
    //   .attr('fill-opacity', .9)
    //   .attr('stroke-width', 2)
    //   .attr('stroke', 'white')
    //   .attr('stroke-opacity', 1)
    //   .attr('ry', this.resizePointHandlerSize)
    //   .attr('rx', this.resizePointHandlerSize)
    //   .attr('cursor', 'ew-resize')
    //   .data([{x: this.pointPositions.four - (this.resizePointHandlerSize / 2), y: (this.width / 2) - (this.resizePointHandlerSize / 2) + this.resizePointHandlerSize}])
    //   .call(this.dragPointFour);
  }

  // Based on the point position, calculate the actual step (from 1 to 10)
  private calculateStep(pointPosition, calcType, pointNumber) {
    let response: any = {};
    if (calcType === 1) {
      let max = 0;
      let min = (this.width / 2) - this.resizePointHandlerSize;
      let step = min / 10;
      let level = parseInt((10 - ((pointPosition - (pointPosition % step)) / this.step)).toFixed(0), 10);
      let increaseBy = 0;
      let decreaseBy = 0;
      if (level === 0) {
        increaseBy = step;
        level = 1;
      } else if (level > 10) {
        decreaseBy = step;
        level = 10;
      }
      if (pointNumber === 1) {
        this.pointPositions.one = pointPosition - (pointPosition % step) + this.resizePointHandlerSize + increaseBy - decreaseBy;
        this.handlerPointOne
          .attr('y', this.pointPositions.one - (this.resizePointHandlerSize / 2));
      } else if (pointNumber === 4) {
        this.pointPositions.four = pointPosition - (pointPosition % step) + this.resizePointHandlerSize + increaseBy - decreaseBy;
        this.handlerPointFour
          .attr('x', this.pointPositions.four - (this.resizePointHandlerSize / 2));
      }
      response = {step: level, closestAnchor: pointPosition - (pointPosition % step) + this.resizePointHandlerSize};

    } else {
      let max = this.width;
      let min = (this.width / 2) + this.resizePointHandlerSize;
      let step = (max - min) / 10;
      let level = parseInt((((pointPosition - (pointPosition % step)) - min) / this.step).toFixed(0), 10);
      let increaseBy = 0;
      let decreaseBy = 0;
      if (level === 0) {
        increaseBy = step;
        level = 1;
      } else if (level > 10) {
        decreaseBy = step;
        level = 10;
      }
      if (pointNumber === 2) {
        this.pointPositions.two = pointPosition - (pointPosition % step) + this.resizePointHandlerSize + increaseBy - decreaseBy;
        this.handlerPointTwo
          .attr('x', this.pointPositions.two - (this.resizePointHandlerSize/2));
      } else if (pointNumber === 3) {
        this.pointPositions.three = pointPosition - (pointPosition % step) + this.resizePointHandlerSize + increaseBy - decreaseBy;
        this.handlerPointThree
          .attr('y', this.pointPositions.three - (this.resizePointHandlerSize/2));
      }
      response = {step: level, closestAnchor: pointPosition - (pointPosition % step) + this.resizePointHandlerSize};
    }
    this.draggablePolygon.attr('points', `${this.width / 2 + this.resizePointHandlerSize}, ${this.pointPositions.one} ${this.pointPositions.two}, ${this.width / 2 + this.resizePointHandlerSize}, ${this.width / 2 + this.resizePointHandlerSize}, ${this.pointPositions.three}, ${this.pointPositions.four} ${this.width / 2 + this.resizePointHandlerSize}`);
    this.indexChanged.emit({index: pointNumber, step: response.step});

    return response;
  }

}
