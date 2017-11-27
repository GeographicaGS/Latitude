import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { D3Service, D3 } from 'd3-ng2-service';

@Component({
  selector: 'latitude-widget-index',
  templateUrl: './widget-index.component.html',
  styleUrls: ['./widget-index.component.scss']
})
export class WidgetIndexComponent implements OnInit {

  @Output() indexChanged: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('svgWrapper') svgWrapper;

  private d3: D3;
  private width: number = 300;
  private height: number = 300;
  private startMin = 100;
  private resizePointHandlerSize = 12;
  private pointPositions = {
    one: this.startMin - 0,
    two: this.width - this.startMin,
    three: this.width - this.startMin,
    four: this.startMin - 0
  };
  private min = (this.width / 2) - this.resizePointHandlerSize;
  private step = this.min / 10;
  private draggablePolygon: any;

  private dragPointOne: any;
  private dragPointTwo: any;
  private dragPointThree: any;
  private dragPointFour: any;

  private svg: any;
  private newg: any;

  private handlerPointOne: any;
  private handlerPointTwo: any;
  private handlerPointThree: any;
  private handlerPointFour: any;

  constructor(d3Service: D3Service) {
    this.d3 = d3Service.getD3();
    this.setDragPoints();
  }

  ngOnInit() {
    this.svg = this.d3.select(this.svgWrapper.nativeElement).append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    this.newg = this.svg.append('g');
    this.newg.append('polygon')
      .attr('points', `${this.width/ 2}, 0 ${this.width}, ${this.width/ 2}, ${this.width/ 2}, ${this.width}, 0 ${this.width/ 2}`).attr('fill-opacity', 0)
      .attr('stroke', '#9397A2')
      .attr('stroke-width', 2);
    for (var i = 1; i < 5; i++) {

      this.newg.append('polygon')
          .attr('points', `${this.width / 2}, ${(this.step * 2) * i} ${this.width - ((this.step * 2) * i)}, ${this.width / 2}, ${this.width / 2}, ${this.width - ((this.step * 2) * i)}, ${(this.step * 2) * i} ${this.width / 2}`)
          .attr('fill-opacity', 0)
          .attr('stroke', '#9397A2')
          .attr('stroke-width', 1)
          .attr('stroke-opacity', .2);
    }
    this.draggablePolygon = this.newg.append('polygon')
      .attr('points', `${this.width / 2}, ${this.startMin} ${this.width - this.startMin}, ${this.width / 2}, ${this.width / 2}, ${this.width - this.startMin}, ${this.startMin} ${this.width / 2}`)
      .attr('fill', 'url(#gradientPolygon)');

    const defs = this.svg.append('defs');
    defs.append('clipPath').attr('id', 'myClip').attr('clip-path', 'url(#gradientPolygon)')
    const gradient = defs.append('radialGradient').attr('id', 'gradientPolygon');
    gradient.append('stop').attr('offset', '0%').attr('stop-opacity', .5).attr('stop-color', 'white');
    gradient.append('stop').attr('offset', '100%').attr('stop-opacity', .8).attr('stop-color', '#0066CC');

    this.setHandlers();
  }

  private setDragPoints() {
    const self = this;
    this.dragPointOne = this.d3.drag()
      .on('drag', (d: any) => {
        d.y = d.y + self.d3.event.dy;
        if (d.y >= (self.width / 2) - self.resizePointHandlerSize) {
          console.log('pointPossitionOne min reached', (self.width / 2) - self.resizePointHandlerSize);
          return;
        } else if (d.y <= 0) {
          console.log('pointPossitionOne max reached', 0);
          return;
        }

        self.pointPositions.one = d.y;
        self.draggablePolygon.attr('points', `${self.width / 2}, ${self.pointPositions.one} ${self.pointPositions.two}, ${self.width / 2}, ${self.width / 2}, ${self.pointPositions.three}, ${self.pointPositions.four} ${self.width / 2}`);
        self.handlerPointOne
          .attr('y', (d) => { return d.y - (self.resizePointHandlerSize / 2); });
      })
      .on('end', (d: any) => {
        this.calculateStep(d.y, 1, 1);
      });

    this.dragPointTwo = this.d3.drag().on('drag', (d: any) => {
      d.x = d.x + self.d3.event.dx;
      if (d.x <= (self.width / 2) + self.resizePointHandlerSize) {
        console.log('pointPossitionTwo min reached', (self.width / 2) + self.resizePointHandlerSize);
        return;
      } else if (d.x === (self.width + 1)) {
        console.log('pointPossitionTwo max reached dragx', self.width, d.x);
        return;
      }

      self.pointPositions.two = d.x;
      self.draggablePolygon.attr('points', `${self.width / 2}, ${self.pointPositions.one} ${self.pointPositions.two}, ${self.width / 2}, ${self.width / 2}, ${self.pointPositions.three}, ${self.pointPositions.four} ${self.width / 2}`);
      self.handlerPointTwo
        .attr('x', (d) => { return d.x - (self.resizePointHandlerSize/2) });
    })
    .on('end', (d: any) => {
      this.calculateStep(d.x, 2, 2);
    });

    this.dragPointThree = this.d3.drag().on('drag', (d: any) => {
      d.y = d.y + self.d3.event.dy;
       if (d.y <= (self.width / 2) + self.resizePointHandlerSize) {
         console.log('pointPossitionThree min reached', (self.width / 2) + self.resizePointHandlerSize);
         return;
       } else if (d.y === this.width) {
         console.log('pointPossitionThree max reached', self.width);
         return;
       }
       self.pointPositions.three = d.y;
       self.draggablePolygon.attr('points', `${self.width / 2}, ${self.pointPositions.one} ${self.pointPositions.two}, ${self.width / 2}, ${self.width / 2}, ${self.pointPositions.three}, ${self.pointPositions.four} ${self.width / 2}`);
       self.handlerPointThree
        .attr('y', (d) => { return d.y - (self.resizePointHandlerSize/2) });
    })
    .on('end', (d: any) => {
      this.calculateStep(d.y, 2, 3);
    });

    this.dragPointFour = this.d3.drag().on('drag', (d: any) => {
      d.x = d.x + self.d3.event.dx;
      if (d.x >= (self.width / 2) - self.resizePointHandlerSize) {
        console.log('pointPossitionFour min reached', (self.width / 2) - self.resizePointHandlerSize);
        return;
      } else if (d.x <= 0) {
        console.log('pointPossitionFour max reached', 0);
        return;
      }
      self.pointPositions.four = d.x;
      self.draggablePolygon.attr('points', `${self.width / 2}, ${self.pointPositions.one} ${self.pointPositions.two}, ${self.width / 2}, ${self.width / 2}, ${self.pointPositions.three}, ${self.pointPositions.four} ${self.width / 2}`);
      self.handlerPointFour
        .attr('x', (d) => { return d.x - (self.resizePointHandlerSize/2) });
    })
    .on('end', (d: any) => {
      this.calculateStep(d.x, 1, 4);
    });
  }

  private setHandlers() {
    this.handlerPointOne = this.newg.append('rect')
      .attr('x', (d) => { return (this.width / 2) - (this.resizePointHandlerSize / 2); })
      .attr('y', (d) => { return this.startMin - (this.resizePointHandlerSize / 2); })
      .attr('height', this.resizePointHandlerSize)
      .attr('width', this.resizePointHandlerSize)
      .attr('id', 'dragtop')
      .attr('fill', '#EAC349')
      .attr('fill-opacity', .9)
      .attr('stroke-width', 2)
      .attr('stroke', 'white')
      .attr('stroke-opacity', 1)
      .attr('ry', this.resizePointHandlerSize)
      .attr('rx', this.resizePointHandlerSize)
      .attr('cursor', 'ns-resize')
      .data([{x: (this.width / 2) - (this.resizePointHandlerSize / 2), y: this.startMin - (this.resizePointHandlerSize / 2)}])
      .call(this.dragPointOne);

      this.handlerPointTwo = this.newg.append('rect')
        .attr('x', (d) => { return (this.width - this.startMin) - (this.resizePointHandlerSize / 2); })
        .attr('y', (d) => { return (this.width / 2) - (this.resizePointHandlerSize / 2); })
        .attr('height', this.resizePointHandlerSize)
        .attr('width', this.resizePointHandlerSize)
        .attr('id', 'dragright')
        .attr('fill', '#094FA4')
        .attr('fill-opacity', .9)
        .attr('stroke-width', 2)
        .attr('stroke', 'white')
        .attr('stroke-opacity', 1)
        .attr('ry', this.resizePointHandlerSize)
        .attr('rx', this.resizePointHandlerSize)
        .attr('cursor', 'ew-resize')
        .data([{x: (this.width - this.startMin) - (this.resizePointHandlerSize / 2), y: (this.width / 2) - (this.resizePointHandlerSize / 2)}])
        .call(this.dragPointTwo);

      this.handlerPointThree = this.newg.append('rect')
        .attr('x', (d) => { return (this.width / 2) - (this.resizePointHandlerSize / 2); })
        .attr('y', (d) => { return (this.width - this.startMin) - (this.resizePointHandlerSize / 2); })
        .attr('height', this.resizePointHandlerSize)
        .attr('width', this.resizePointHandlerSize)
        .attr('id', 'dragbottom')
        .attr('fill', '#F24440')
        .attr('fill-opacity', .9)
        .attr('stroke-width', 2)
        .attr('stroke', 'white')
        .attr('stroke-opacity', 1)
        .attr('ry', this.resizePointHandlerSize)
        .attr('rx', this.resizePointHandlerSize)
        .attr('cursor', 'ns-resize')
        .data([{x: (this.width / 2) - (this.resizePointHandlerSize / 2), y: (this.width - this.startMin) - (this.resizePointHandlerSize / 2)}])
        .call(this.dragPointThree);

      this.handlerPointFour = this.newg.append('rect')
        .attr('x', (d) => { return this.startMin - (this.resizePointHandlerSize / 2); })
        .attr('y', (d) => { return (this.width / 2) - (this.resizePointHandlerSize / 2); })
        .attr('height', this.resizePointHandlerSize)
        .attr('width', this.resizePointHandlerSize)
        .attr('id', 'dragleft')
        .attr('fill', '#B24DAE')
        .attr('fill-opacity', .9)
        .attr('stroke-width', 2)
        .attr('stroke', 'white')
        .attr('stroke-opacity', 1)
        .attr('ry', this.resizePointHandlerSize)
        .attr('rx', this.resizePointHandlerSize)
        .attr('cursor', 'ew-resize')
        .data([{x: this.startMin - (this.resizePointHandlerSize / 2), y: (this.width / 2) - (this.resizePointHandlerSize / 2)}])
        .call(this.dragPointFour);
  }

  calculateStep(pointPosition, calcType, pointNumber) {
    let response: any = {};
    if (calcType === 1) {
      let max = 0;
      let min = (this.width / 2) - this.resizePointHandlerSize;
      let step = min / 10;
      if (pointNumber) {
        if (pointNumber === 1) {
          this.pointPositions.one = pointPosition - (pointPosition % step);
          this.handlerPointOne
            .attr('y', this.pointPositions.one - (this.resizePointHandlerSize / 2));
        } else if (pointNumber === 4) {
          this.pointPositions.four = pointPosition - (pointPosition % step);
          this.handlerPointFour
            .attr('x', this.pointPositions.four - (this.resizePointHandlerSize / 2));
        }
      }
      response = {step: (10 - ((pointPosition - (pointPosition % step)) / this.step)).toFixed(0), closestAnchor: pointPosition - (pointPosition % step)};

    } else {
      let max = this.width;
      let min = (this.width / 2) + this.resizePointHandlerSize;
      let step = (max - min) / 10;

      if (pointNumber) {
        if (pointNumber === 2) {
          this.pointPositions.two = pointPosition - (pointPosition % step);
          this.handlerPointTwo
            .attr('x', this.pointPositions.two - (this.resizePointHandlerSize/2));
        } else if (pointNumber === 3) {
          this.pointPositions.three = pointPosition - (pointPosition % step);
          this.handlerPointThree
            .attr('y', this.pointPositions.three - (this.resizePointHandlerSize/2));
        }
      }
      response = {step: (((pointPosition - (pointPosition % step)) - min) / this.step).toFixed(0), closestAnchor: pointPosition - (pointPosition % step)};
    }
    this.draggablePolygon.attr('points', `${this.width / 2}, ${this.pointPositions.one} ${this.pointPositions.two}, ${this.width / 2}, ${this.width / 2}, ${this.pointPositions.three}, ${this.pointPositions.four} ${this.width / 2}`);
    this.indexChanged.emit({index: pointNumber, step: response.step});

    return response;
  }

}
