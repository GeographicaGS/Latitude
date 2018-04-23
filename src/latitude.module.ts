import { NgModule, ModuleWithProviders } from '@angular/core';
import { Http } from '@angular/http';
import { CommonModule as NGCommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { D3Service } from 'd3-ng2-service';

import {
  WidgetCategoryComponent,
  WidgetIndexComponent,
  WidgetVariableComponent,
  WidgetStackedBarsComponent,
  WidgetHighlightComponent
} from './components/widgets';

import {
  MapComponent,
  MapboxMarkerHandler,
  AuthenticationService,
  AuthGuard,
  DataSource,
  DateRangePickerComponent,
  SelectfilterComponent,
  SwitcherComponent,
  ToggleComponent,
  SidebarComponent,
  ProgressButtonComponent,
  TabNavigationComponent,
  LoadingComponent,
  MapService,
  FormatNumberPipe
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
  WidgetVariableComponent,
  WidgetIndexComponent,
  WidgetStackedBarsComponent,
  WidgetHighlightComponent,
  MapComponent,
  LoadingComponent,
  TabNavigationComponent,
  FormatNumberPipe
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
      providers: [AuthenticationService, AuthGuard, MapboxMarkerHandler, D3Service, MapService, {provide: 'config', useValue: config}]
    };
  }
}
