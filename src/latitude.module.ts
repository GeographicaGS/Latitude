import { NgModule, ModuleWithProviders } from '@angular/core';
import { Http } from '@angular/http';
import { CommonModule as NGCommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from 'ng2-translate';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { D3Service } from 'd3-ng2-service';

import { WidgetCategoryComponent, WidgetIndexComponent } from './components/widgets';
import {
  MapComponent,
  AuthenticationService,
  AuthGuard,
  DateRangePickerComponent,
  SelectfilterComponent,
  SwitcherComponent,
  ToggleComponent,
  SidebarComponent,
  ProgressButtonComponent
 } from './index';

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
  WidgetCategoryComponent,
  WidgetIndexComponent,
  MapComponent
];

@NgModule({
  imports: [...modules],
  providers: [D3Service],
  declarations: components,
  exports: [...modules, ...components]
})
export class LatitudeModule {
  static forRoot(config: any): ModuleWithProviders {
    return {
      ngModule: LatitudeModule,
      providers: [AuthenticationService, AuthGuard, D3Service, {provide: 'config', useValue: config}]
    };
  }
}
