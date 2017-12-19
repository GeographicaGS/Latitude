import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class MapService {

  private map = new BehaviorSubject<any>(null);
  map$ = this.map.asObservable();

  constructor() { }

  setMap(map) {
    this.map.next(map);
  }

}
