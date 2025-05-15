import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { HistoryPageModule } from '../pages/history/history.module';
import { MultiplePageModule } from '../pages/multiple/multiple.module';
import { MemoryListPageModule } from '../pages/memory-list/memory-list.module';

import { HttpdProvider } from '../providers/httpd/httpd';
import { SettingsPageModule } from '../pages/settings/settings.module';
import { IonicStorageModule } from '@ionic/storage';


import { DataInfoProvider } from '../providers/data-info/data-info';
import { NativeStorage } from '@ionic-native/native-storage';
import { UiUtilsProvider } from '../providers/ui-utils/ui-utils';
import { HttpClientModule } from '@angular/common/http';

import { ConfigurationService } from "ionic-configuration-service";
//import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';Só colocar no estoque
import { MultiplePage } from '../pages/multiple/multiple';
import { GpiosProvider } from '../providers/gpios/gpios';

import { NativeAudio } from '@ionic-native/native-audio';

import { File } from '@ionic-native/file';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { AudioUtilsProvider } from '../providers/audio-utils/audio-utils';
import { SideMenuContentComponent } from '../shared/side-menu-content/side-menu-content.component';
import { ListaBrancaProvider } from '../providers/lista-branca/lista-branca';

import { TooltipsModule } from 'ionic-tooltips';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export function loadConfiguration(configurationService: ConfigurationService): () => Promise<void> {
  return () => configurationService.load("assets/configs/document.json");
}

//const config: SocketIoConfig = { url: 'http://raspberrypi:8085', options: {} };


@NgModule({
  declarations: [
    MyApp,
    HomePage, 
    SideMenuContentComponent
  ],
  
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    TooltipsModule.forRoot(),
    BrowserAnimationsModule,

    IonicModule.forRoot(MyApp, {}, {
      links: [
        { component: HomePage, name: 'Home'},
        { component: MultiplePage, name: 'Multiple'}        
      ]}),

  //  SocketIoModule.forRoot(config)
  ],
  exports: [
    MultiplePageModule,
    HistoryPageModule,
    SettingsPageModule,
    MemoryListPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
  ],
  providers: [        
    NativeStorage,
    NativeAudio,
    BarcodeScanner,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    HttpdProvider,    
    DataInfoProvider,
    UiUtilsProvider,
    ConfigurationService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfiguration,
      deps: [ConfigurationService],
      multi: true
    },
    GpiosProvider,
    AudioUtilsProvider,
    ListaBrancaProvider
  ]
})

export class AppModule {
  static injector: Injector;

  constructor(injector: Injector) {
    AppModule.injector = injector;
  }
}