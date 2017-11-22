import { NgModule } from '@angular/core';
import { Http } from '@angular/http';
import { CommonModule as NGCommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
import { MyDateRangePickerModule } from 'mydaterangepicker';

import { WidgetCategoryComponent } from './widgets';

import {
  DateRangePickerComponent,
  SelectfilterComponent,
  SwitcherComponent,
  ToggleComponent,
  SidebarComponent,
  ProgressButtonComponent
 } from './index';

export function createTranslateLoader(http: Http) {
    return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

/**
 * Exported Modules
 * @type {Array}
 */
const modules = [
  NGCommonModule,
  FormsModule,
  TranslateModule,
  MyDateRangePickerModule
];

/**
 * Exported Components
 * @type {Array}
 */
const components = [
  DateRangePickerComponent,
  SelectfilterComponent,
  SwitcherComponent,
  ToggleComponent,
  SidebarComponent,
  ProgressButtonComponent,
  WidgetCategoryComponent
];

@NgModule({
  imports: [...modules],
  providers: [],
  declarations: components,
  exports: [...modules, ...components]
})
export class LatitudeModule { }
