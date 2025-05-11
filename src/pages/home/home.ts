import { Component, ViewChild, OnDestroy } from '@angular/core';
import { NavController, NavParams, Events, Searchbar } from 'ionic-angular';
import { Subscription, Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import 'moment/locale/pt-br';

import { HttpdProvider } from '../../providers/httpd/httpd';
import { DatabaseProvider } from '../../providers/database/database';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { ListaBrancaProvider } from '../../providers/lista-branca/lista-branca';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils';
import { GpiosProvider } from '../../providers/gpios/gpios';
import { AudioUtilsProvider } from '../../providers/audio-utils/audio-utils';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnDestroy {
  @ViewChild('searchbar') searchbar: Searchbar;

  // State vars
  private destroy$ = new Subject<void>();
  private intervalSub: Subscription;

  idTypeBackground = this.dataInfo.backgroundIdNone;
  ticketRead = false;
  decrementing = false;
  inputVisible = true;
  isLoading = true;
  updating = false;
  updatedInfo = false;

  title: string = this.dataInfo.titleGeneral;
  message1: string = this.dataInfo.isLoading;
  message2: string = this.dataInfo.isLoading;
  counter: string = this.dataInfo.isLoading;
  statusTicket: string = this.dataInfo.ticketOk;

  history: string = this.dataInfo.history;
  historyText1: string = this.dataInfo.historyUntilDay;
  historyText2: string = this.dataInfo.accessPoints;
  historyText3: string = this.dataInfo.usedDay;

  searchTicket = '';

  // Identifiers
  areaId = this.dataInfo.areaId;
  pontoId = this.dataInfo.totemId;
  areaName: string;

  constructor(
    public dataInfo: DataInfoProvider,
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,
    public db: DatabaseProvider,
    public navParams: NavParams,
    public gpios: GpiosProvider,
    public events: Events,
    public audio: AudioUtilsProvider,
    public whiteList: ListaBrancaProvider,
    public http: HttpdProvider
  ) {
    moment.locale('pt-BR');
    this.audio.preload('success', 'assets/audio/success.mp3');
    this.audio.preload('error', 'assets/audio/error.mp3');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.events.unsubscribe('totem:updated');
    this.events.unsubscribe('socket:pageMultiple');
    this.events.unsubscribe('socket:pageHistory');
    this.events.unsubscribe('socket:decrementCounter');
    this.events.unsubscribe('lista-branca-callback');
    if (this.intervalSub) this.intervalSub.unsubscribe();
  }

  ionViewDidLoad() {
    this.reload();
  }

  reload() {
    this.resetState();
    this.updatedInfo = !!this.navParams.get('updatedInfo');
    if (this.updatedInfo) this.updateCounter();
    this.subscribeEvents();
  }

  private resetState() {
    this.searchTicket = '';
    this.history = '';
    this.dataInfo.ticketRead = this.dataInfo.ticketReadDefault;
    this.updating = false;
  }

  private subscribeEvents() {
    this.events.subscribe('totem:updated', data => {
      this.onConfigLoaded(data);
      this.events.unsubscribe('totem:updated');
    });
    this.events.subscribe('socket:pageMultiple', () => this.navCtrl.push('Multiple'));
    this.events.subscribe('socket:pageHistory', () => this.showHistory());
    this.events.subscribe('socket:decrementCounter', () => this.changeCounter(-1));
    this.events.subscribe('listaBrancaConfig', () => {
      this.events.subscribe('lista-branca-callback', data => this.onSearchCallback(data, data.success[0].result[0].id_estoque_utilizavel));
    });
  }

  private onConfigLoaded(data: any) {
    if (!data.length) {
      this.title = this.dataInfo.ipNotFound;
      this.counter = '0';
      return;
    }

    const cfg = data.success[0];
    this.title = cfg.nome_area_acesso;
    this.counter = cfg.lotacao_area_acesso;
    this.areaId = cfg.fk_id_area_acesso;
    this.pontoId = cfg.id_ponto_acesso;
    this.areaName = this.title;
    this.dataInfo.tipoPontoAcesso = cfg.tipo_ponto_acesso;
    this.startAutoRefresh();
    this.totemReady();
    this.uiUtils.showToast(this.dataInfo.inicializedSuccessfully);
    this.dataInfo.totemId = cfg.id_ponto_acesso;
  }

  private startAutoRefresh() {
    this.intervalSub = interval(10000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.updating) this.updateCounter();
        if (this.inputVisible) {
          this.searchTicket = '';
          this.setFocus();
        }
      });
  }

  private updateCounter() {
    this.updating = true;
    this.http.getAreaCounter(this.areaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        const lot = res[0]?.lotacao_area_acesso;
        if (lot == null) this.uiUtils.showToast(this.dataInfo.configureYourSystem);
        else this.counter = lot;
        this.updating = false;
      });
  }

  decrementCounter() { this.changeCounter(-1, true); }
  incrementCounter() { this.changeCounter(+1); }

  private changeCounter(delta: number, isDecrement: boolean = false) {
    this.updating = true;
    this.updatedInfo = false;
    const obs = isDecrement ? this.http.decrementAreaCounter(this.areaId) : this.http.incrementAreaCounter(this.areaId);
    obs.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updating = false;
      this.updatedInfo = true;
      if (isDecrement) this.decrementing = false;
    });
    if (isDecrement) this.decrementing = true;
  }

  setFilteredItems() {
    if (this.searchTicket?.length === 7 && this.inputVisible) this.searchOneTicket();
  }

  private searchOneTicket() {
    if (!this.searchTicket) return;
    this.dataInfo.ativaRedeOnline ? this.searchOnline() : this.searchOffline();
  }

  private searchOffline() {
    this.whiteList.searchOneTicket(this.searchTicket.substr(0, 8));
  }

  private searchOnline() {
    const code = this.searchTicket.substr(0, 8);
    this.totemBusy();
    const call = this.dataInfo.totemSaida === 0 ? this.http.checkTicketExist(code) : this.http.checkTicketOut(code);
    call.pipe(takeUntil(this.destroy$)).subscribe(data => this.handleSearchResponse(data, code));
  }

  private handleSearchResponse(data: any, ticket: string) {
    this.totemReady();
    if (data.success?.[0]?.callback === 100) {
      // Valid ticket
      this.dataInfo.ativaRedeOnline ? this.useTicketNetwork(ticket) : this.useTicketOffline(data, ticket);
    } else {
      this.processCallbackCode(data.success[0].callback, ticket, data.success[0].result);
    }
  }

  private processCallbackCode(code: number, ticket: string, result: any) {
    switch (code) {
      case 1: return this.ticketNotExist(ticket);
      case 2: return this.ticketNotSold(ticket);
      case 3:
      case 4: return this.ticketAccessDenied(ticket, result);
      case 5: return this.ticketExpiredSameDay(ticket, result);
      case 6: return this.ticketExpiredByTime(result);
      case 8: return this.ticketDoorTimeExceeded(result);
      case 9: return this.ticketExpiredSameDay(result);
      case 10: return this.ticketAlreadyUsed(result);
      case 11: return this.ticketMaxCountExceeded(result);
      case 12: return this.ticketDoorTimeExceeded(result, true);
      default: return this.showError(this.dataInfo.accessDenied, this.dataInfo.unknownError, ticket);
    }
  }

  private ticketNotExist(t: string) { this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketNotRegisteredMsg, t); }
  private ticketNotSold(t: string) { this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketNotSoldedMsg, t); }
  private ticketAccessDenied(ticket: string, points: any[]) {
    let msg = this.dataInfo.ticketNotAllowed;
    if (this.idTypeBackground >= this.dataInfo.backgroundIdSearch) {
      const list = points.map(p => ` - ${p.nome_ponto_acesso}`).join('');
      msg += this.dataInfo.titleTicketAllowedAccessPoints + list;
    }
    this.showError(this.dataInfo.accessDenied, msg, ticket);
  }
  private ticketExpiredSameDay(ticket: string, data: any[]) {
    const d = data[0].data_log_venda;
    this.history = this.dataInfo.ticketRead + ticket;
    const start = moment(d).format('LL');
    this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketExpired + start, ticket);
  }
  private ticketExpiredByTime(data: any[]) {
    const d = data[0];
    const until = moment(d.data_log_venda).add(d.tempo_validade, 'hours').format('LL');
    this.showError(this.dataInfo.accessDenied, this.dataInfo.titleTicketInvalid + until, d.id_estoque_utilizavel);
  }
  private ticketDoorTimeExceeded(data: any[], used: boolean = false) {
    const d = data[0];
    const stamp = used ? moment(d.data_log_utilizacao).format('LLL') : moment(d.data_log_venda).add(d.horas_porta_acesso, 'hours').format('LLL');
    this.showError(this.dataInfo.accessDenied, (used ? 'Tempo máximo de uso excedido: ' : this.dataInfo.titleTicketInvalid) + stamp, d.id_estoque_utilizavel);
  }
  private ticketAlreadyUsed(data: any[]) {
    const d = data[0];
    const stamp = moment(d.data_log_utilizacao).format('LL');
    this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketAlreadyUsed + ` - ${d.nome_ponto_acesso} - ${stamp}`, d.id_estoque_utilizavel);
  }
  private ticketMaxCountExceeded(data: any[]) { this.ticketAlreadyUsed(data); }

  private useTicketOffline(res: any, ticket: string) {
    this.showSuccess(ticket, res.success[0].result[0]);
  }

  private useTicketNetwork(ticket: string) {
    this.http.useTicket(ticket)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => this.showSuccess(ticket, res.success[0]));
  }

  private showSuccess(ticket: string, info: any) {
    const type = this.dataInfo.ativaRedeOnline ? info.nome_produto_peq : info.nome_produto_peq;
    const subtype = this.dataInfo.ativaRedeOnline ? info.nome_subtipo_produto : info.nome_subtipo_produto;
    this.ticketRead = true;
    this.dataInfo.ticketRead = this.dataInfo.ticketReadDefault;
    this.history = this.dataInfo.ticketRead + ticket;
    this.statusTicket = this.dataInfo.ticketOk;
    this.idTypeBackground = this.dataInfo.backgroundIdGreen;
    this.message1 = this.dataInfo.welcomeMsg;
    this.message2 = `${type} - ${subtype}`;
    this.changeCounter(+1);
    this.showGpioSuccess();
    setTimeout(() => this.backHome(), this.dataInfo.timeMessage);
  }

  private showError(title: string, msg: string, ticket: string) {
    this.isLoading = false;
    this.ticketRead = true;
    this.dataInfo.ticketRead = this.dataInfo.ticketReadDefault;
    this.history = this.dataInfo.ticketRead + ticket;
    this.idTypeBackground = this.idTypeBackground === this.dataInfo.backgroundIdSearch
      ? this.dataInfo.backgroundIdSearchNotOk
      : this.dataInfo.backgroundIdRed;
    this.message1 = title;
    this.message2 = msg;
    this.showGpioError();
    setTimeout(() => this.backHome(), this.dataInfo.timeMessage);
  }

  private totemBusy() { this.inputVisible = false; this.isLoading = true; this.updating = true; }
  private totemReady() { this.inputVisible = true; this.isLoading = false; this.updating = false; this.setFocus(); }
  private showGpioError() { this.audio.play('error'); this.http.activeGpioError().subscribe(); }
  private showGpioSuccess() { this.audio.play('success'); this.http.activeGpioSuccess().subscribe(); }

  private showHistory() {
    this.setFocus();
    this.idTypeBackground = this.dataInfo.backgroundIdSearch;
    this.statusTicket = this.dataInfo.already;
    this.ticketRead = false;
    clearInterval(this.handleClearInterval);
    this.handleClearInterval = setTimeout(() => {
      this.idTypeBackground = this.dataInfo.backgroundIdNone;
      this.searchTicket = '';
      this.setFocus();
    }, 6000);
  }

  private backHome() {
    this.dataInfo.tipoPontoAcesso === 1 ? this.backWithDelay() : this.resetState();
  }

  private backWithDelay() {
    const delay = [this.dataInfo.backgroundIdSearchNotOk, this.dataInfo.backgroundIdSearchOk]
      .includes(this.idTypeBackground) ? this.dataInfo.timeMessageHistory : this.dataInfo.timeMessage;
    setTimeout(() => this.resetState(), delay);
  }

  private setFocus() { setTimeout(() => this.searchbar.setFocus(), 100); }

  openGateIn() {
    this.http.systemCommand(1, 1, this.dataInfo.receptorOne)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.uiUtils.showAlert(this.dataInfo.sucess, this.dataInfo.titleCommandSuccess).present().then(() => this.http.goPDVi()));
  }

  openGateOut() {
    this.http.systemCommand(1, 1, this.dataInfo.receptorTwo)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.uiUtils.showAlert(this.dataInfo.sucess, this.dataInfo.titleCommandSuccess).present().then(() => this.http.goPDVi()));
  }
}
