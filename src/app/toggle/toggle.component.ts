import { Component, Input, Output, forwardRef, EventEmitter, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

const CHECKBOX_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ToggleComponent),
  multi: true
}

@Component({
  selector: 'toggle',
  inputs: ['label'],
  providers: [CHECKBOX_VALUE_ACCESSOR],
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})

export class ToggleComponent implements OnInit, ControlValueAccessor {
  private _checked: boolean = false;

  @Input()
  get checked(): boolean { return this._checked; }
  set checked(value) { this._checked = value; this.onChangeCallback(this._checked); }

  @Output() change = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  toggleChecked() { this.checked = !this.checked; this.change.emit(this.checked); }

  writeValue(value: any): void {
    this._checked = value;
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  private onTouchedCallback = () => { /* Placeholder */ }

  private onChangeCallback = (_: any) => { /* Placeholder */ }

}
