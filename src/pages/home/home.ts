import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { ListaBrancaProvider } from '../../providers/lista-branca/lista-branca'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { Observable } from 'rxjs/Observable';
import { TextInput } from 'ionic-angular';
import moment from 'moment';
import 'moment/locale/pt-br';
import { GpiosProvider } from '../../providers/gpios/gpios';
import { AudioUtilsProvider } from '../../providers/audio-utils/audio-utils';




@Component({
  selector: 'page-home',
  templateUrl: 'home.html'

})
export class HomePage {
  @ViewChild('searchbarInput') searchbarInput:TextInput;
  

  configs: Observable<any>;
  areaInfo: Observable<any>;
  ticket: Observable<any>;    
  
  decrementingCounter: Boolean = false
  handleClearInterval: any
  idTypeBackgrond: number = this.dataInfo.backgroundIdNone;
  ticketRead: Boolean = false

  titleTicketOne: string = "Ingresso"
  multipleColor: string = "danger"

  title: string = this.dataInfo.titleGeneral
  message1: string = this.dataInfo.isLoading
  message2: string = this.dataInfo.isLoading  
      
  areaId: number = this.dataInfo.areaId
  pontoId: number = this.dataInfo.totemId
  areaName: string;
  updatedInfo: Boolean = false
  updating: Boolean = false
  inputVisible: Boolean = true  
  isLoading: Boolean = true

  counter: string = this.dataInfo.isLoading
  statusTicket: string = this.dataInfo.ticketOk
  statusTicketStart: string = ""   
  statusTicketUsedOn: string = ""

  history: string = this.dataInfo.history
  historyText1: string = this.dataInfo.historyUntilDay
  historyText2: string = this.dataInfo.accessPoints
  historyText3: string = this.dataInfo.usedDay

  searchTicket: string = '';    
  searching: any = false;  
  
  constructor(
    public dataInfo: DataInfoProvider,
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,     
    public navParams: NavParams,   
    public gpios: GpiosProvider,  
    public events: Events,
    public audioUtils: AudioUtilsProvider,
    public listaBranca: ListaBrancaProvider,
    public http: HttpdProvider) { 
      
      moment.locale('pt-BR');  
      this.audioUtils.preload('success', 'assets/audio/success.mp3');    
      this.audioUtils.preload('error', 'assets/audio/error.mp3');          
  }  

  ngOnDestroy() {    
    //this.unsubscribeStuff()  
  }

  unsubscribeStuff(){
    this.events.unsubscribe('totem:updated');		
    this.events.unsubscribe('socket:pageMultiple');		
    this.events.unsubscribe('socket:decrementCounter');		
    this.events.unsubscribe('socket:pageHistory');		
  }
    
  ionViewDidLoad() {           
    this.reload()    
   // this.dev()  
  }

  ionViewDidEnter() {
    // espera um tick para garantir que o componente já está renderizado
    setTimeout(() => this.setFocus(), 0);
  }
      

  dev(){

    let self = this
    setTimeout(() => {
      self.searchTicket = '19520001'
      self.searchOneTicket()
    }, 1000)
  }

  modeOperation(){    
    console.log('ativaListaBranca', this.dataInfo.ativaListaBranca)
    console.log('ativaRedeOnline', this.dataInfo.ativaRedeOnline)
    console.log('ativaHotspot', this.dataInfo.ativaHotspot)
    console.log('ativaSincronizacaoUsb', this.dataInfo.ativaSincronizacaoUsb)    
  }

  reload(){
    this.searchTicket = ''
    this.history = ''
    this.dataInfo.ticketRead = this.dataInfo.ticketReadDefault
    
    this.updatedInfo = this.navParams.get('updatedInfo')
    this.updating = false

    if(this.updatedInfo == undefined)
        this.updatedInfo = false
      
    if(this.updatedInfo)
        this.updateInfo()
            
    this.subscribeStuff()  
  }

  subscribeStuff(){
    let self = this

    this.events.subscribe('listaBrancaConfig', () => {      
      this.subscribeListaBranca()
    });
       
    this.events.subscribe('socket:pageMultiple', () => {
      this.setMultiple()
    });

    this.events.subscribe('socket:pageHistory', () => {
      this.goHistory()
    });

    this.events.subscribe('socket:decrementCounter', () => {
      this.decrementCounter()
    });

    this.events.subscribe('totem:updated', (data) => {      
      self.loadConfigCallback(data)
      self.events.unsubscribe('totem:updated');	
    });
  }

  subscribeListaBranca(){

    this.events.subscribe('lista-branca-callback', data => {
        this.listaBrancaAcessoCallback(data)            
    });
  }

  listaBrancaAcessoCallback(data){    
    this.seachOneTicketCallback(data, data.success[0].result[0].id_estoque_utilizavel)
    this.totemWorking()
  }  
 
  startTimer(){
    let self = this

    setInterval(function(){ 

      if(! self.updating)

          self.updateInfo();                     

          if(self.inputVisible){
            self.searchTicket = ""
            self.setFocus();
          }            
    
    }, 10000);      
  } 

  setFocus(){    

    if(this.searchbarInput){     
      console.log(this.inputVisible) 
      this.searchbarInput.setFocus();                
    }
      
  }

  resetConfig(){
    let self = this
    self.idTypeBackgrond = self.dataInfo.backgroundIdNone
    self.searchTicket = ''
    self.searching = false    
    self.ticketRead = false
    self.title = self.areaName
    self.history = self.dataInfo.historyGeneral
    self.dataInfo.ticketRead = self.dataInfo.ticketReadDefault
    self.totemWorking()  
  }

  backHome(){
        
    if(this.dataInfo.tipoPontoAcesso === 1)
      this.backWithMessage()
    else  
      this.resetConfig()
  }

  backWithMessage(){
    let self = this    
    let time = this.dataInfo.timeMessage    

    if(this.idTypeBackgrond === this.dataInfo.backgroundIdSearchNotOk || 
        this.idTypeBackgrond === this.dataInfo.backgroundIdSearchOk){

          time = this.dataInfo.timeMessageHistory
        }
      
    setTimeout(function(){ 
      self.resetConfig()
    }, time); 
  }

  goHistory(){
    
    this.setFocus()
    this.statusTicket = this.dataInfo.already
    this.idTypeBackgrond = this.dataInfo.backgroundIdSearch    
    this.ticketRead = false
    let self = this    

    clearInterval(this.handleClearInterval)

    this.handleClearInterval = setTimeout(function(){ 
      
      self.idTypeBackgrond = self.dataInfo.backgroundIdNone
      self.searchTicket = ''
      self.searching = false    
      self.setFocus()

    }, 6000);

  }

  showHistory(){

    if(this.idTypeBackgrond !== this.dataInfo.backgroundIdSearch){
        this.goHistory()

    } else {
      this.idTypeBackgrond = this.dataInfo.backgroundIdNone
    }   
  }

  decrementCounter(){
    this.updating = true
    this.updatedInfo = false
    this.decrementingCounter = true

    this.http.decrementAreaCounter(this.dataInfo.areaId)
    .subscribe( () => {      

      this.updating = false
      this.updatedInfo = true
      this.decrementingCounter = false
    })      
  }

  incrementCounter(){
    this.updating = true
    this.updatedInfo = false

    this.http.incrementAreaCounter(this.areaId)
    .subscribe( () => {      

      this.updating = false
      this.updatedInfo = true
    })      
  }    

  loadConfigCallback(data){    

    if(!data){

      this.title = this.dataInfo.ipNotFound
      this.counter = "0"
    }

    else {      
      let self = this

      let element = data.success[0]
    
      self.title = element.nome_area_acesso
      self.counter = element.lotacao_area_acesso       
      self.areaId = element.fk_id_area_acesso    
      self.pontoId = element.fk_id_ponto_acesso
      self.areaName = self.title
      self.dataInfo.tipoPontoAcesso = element.tipo_ponto_acesso        
      self.startTimer()
      self.idTypeBackgrond = self.dataInfo.backgroundIdNone
      self.totemWorking()
      self.uiUtils.showToast(this.dataInfo.inicializedSuccessfully)
      self.dataInfo.totemId = element.id_ponto_acesso
    }    
  }
  
  updateInfo(){

    this.updating = true
    this.updatedInfo = false

    let self = this
         
    return this.http.getAreaCounter(this.areaId).subscribe(data => {

      Object.keys(data).map(function(personNamedIndex){
        let person = data[personNamedIndex];     

        if(person[0].lotacao_area_acesso == undefined){
          self.uiUtils.showToast(this.dataInfo.configureYourSystem)

        } else {
          self.counter = person[0].lotacao_area_acesso
        }        
      }); 
      
      self.updating = false
    })
  }

  setFilteredItems(){            
    if(this.searchTicket.length == 8 && this.inputVisible)
      this.searchOneTicket() 
  } 

  totemWorking(){
    console.log(' Totem funcionando')
    this.inputVisible = true    
    this.isLoading = false
    this.updating = false        
  }

  totemNotWorking(){
    this.inputVisible = false
    this.isLoading = true
    this.updating = true
  }

  showGpioError(){
    this.audioUtils.play('error');

    this.http.activeGpioError().subscribe(data => {
      console.log("showGpioError")
    })
  }

  showGpioSuccess(){

    this.audioUtils.play('success');

    this.http.activeGpioSuccess().subscribe(data => {
      console.log("showGpioSuccess")
    })
  }

  showError(str1, str2, ticket){  

    this.isLoading = false
    this.ticketRead = true            
    
    this.dataInfo.ticketRead = this.dataInfo.ticketReadDefault
    this.history = this.dataInfo.ticketRead + ticket
    
    if(this.idTypeBackgrond === this.dataInfo.backgroundIdSearch){                      
      this.idTypeBackgrond = this.dataInfo.backgroundIdSearchNotOk                   
      this.historyText1 = this.dataInfo.ticketNotOk    
      this.historyText2 = str2

    } else {                  
      this.idTypeBackgrond = this.dataInfo.backgroundIdRed      
      this.message1 = str1
      this.message2 = str2
    }

    console.log(str1, str2, ticket)

    this.showGpioError()
    
    setTimeout(() => {
      this.backHome()    
    }, this.dataInfo.timeMessage)
  }

  searchOneTicket(){      


    if(this.searchTicket !== ""){

        if(this.dataInfo.ativaRedeOnline){
          this.searchOneNetwork()
        }
        else {
          this.searchOneListaBranca()
        }
    }                     
  }  

  searchOneListaBranca(){
    let str = this.searchTicket.substring(0,8)
    this.listaBranca.searchOneTicket(str)
  }

  searchOneNetwork(){
    let str = this.searchTicket.substring(0,8)
    this.totemNotWorking()      
    
    if(this.dataInfo.totemSaida === 0)
      this.searchTicketIn(str)
    else 
      this.searchTicketOut(str)
  }

  searchTicketIn(str: string){

    this.http.checkTicketExist(str).subscribe( data => {

      this.seachOneTicketCallback(data, str)
      this.totemWorking()
    }) 
  }


  searchTicketOut(str: string){

    this.http.checkTicketOut(str).subscribe( data => {      
      this.searchTicketOutCallback(data)    
    }) 
  }

  searchTicketOutCallback(data){        

    this.statusTicket = this.dataInfo.ticketOk
    this.idTypeBackgrond = this.dataInfo.backgroundIdGreen    
    this.message1 = this.dataInfo.goodByeMsg              
    this.message2 = ""
    this.decrementCounter()
    this.showGpioSuccess()
    this.backHome()
  }

  seachOneTicketCallback(data, ticketTmp){            

    console.log('Callback recebido: ', data.success[0].callback)
    
    if(data.success[0].callback == 1)
      this.ticketNotExist(ticketTmp)

    else if(data.success[0].callback == 2)
      this.ticketNotSold(ticketTmp)

    else if(data.success[0].callback == 3)
      this.checkTicketAreaAccessDenied(ticketTmp, data.success[0].result)

    else if(data.success[0].callback == 4)
      this.checkTicketAreaAccessDenied(ticketTmp, data.success[0].result)

    else if(data.success[0].callback == 5)
      this.ticketValidityNotSame(ticketTmp, data)

    else if(data.success[0].callback == 6)
      this.ticketValidityTimeNotOk(data)

    else if(data.success[0].callback == 8)
      this.ticketAccessTimeDoorNotOk(data)

    else if(data.success[0].callback == 9)
      this.ticketAccessSameDayNotOk(data)

    else if(data.success[0].callback == 10)
      this.ticketAlreadUsedFinish(data)

    else if(data.success[0].callback == 11)
      this.ticketAccessCountPassNotOk(data)    

    else if(data.success[0].callback == 12)
      this.ticketAccessTimeDoorNotOkNotUsedContinue(data)

    else if(data.success[0].callback == 100){

      if(this.dataInfo.ativaRedeOnline)
        this.useTicket(ticketTmp)

      else
        this.useTicketEnd(data, ticketTmp)
    }
      
  }
  
  ticketNotExist(ticket){   
    this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketNotRegisteredMsg, ticket)    
  }
    
  ticketNotSold(ticket){          
    this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketNotSoldedMsg, ticket)
  }

  checkTicketAreaAccessDenied(ticket, data){   
    let pontos = ""        
    let msg = this.dataInfo.ticketNotAllowed 

    if(this.idTypeBackgrond >= this.dataInfo.backgroundIdSearch){

      data.forEach(element => {
        pontos += " - " + element.nome_ponto_acesso 
      });

      msg = this.dataInfo.ticketNotAllowed + this.dataInfo.titleTicketAllowedAccessPoints + pontos
    }            

    this.showError(this.dataInfo.accessDenied, msg, ticket)
  }    
 
  ticketValidityNotSame(ticketTmp, ticket){           
    let data = ticket.success[0].result[0]    
    let datalogvenda = data.data_log_venda

    this.history = this.dataInfo.ticketRead + ticketTmp
    this.statusTicketStart = moment(datalogvenda).format("LL")      
    let message = this.dataInfo.ticketExpired + this.statusTicketStart

    this.showError(this.dataInfo.accessDenied, message, ticketTmp)            
  }

  ticketValidityTimeNotOk(ticket){    
    let data = ticket.success[0].result.result[0]
    let id_estoque_utilizavel = data.id_estoque_utilizavel
    let tempo_validade = data.tempo_validade    
    
    let message = this.dataInfo.titleTicketInvalid + moment(data.data_log_venda).hours(tempo_validade).format("LL");        
    this.showError(this.dataInfo.accessDenied, message, id_estoque_utilizavel)        
  }
  
  ticketAccessTimeDoorNotOk(ticket){      
    let data = ticket.success[0].result[0]  
    let id_estoque_utilizavel = data.id_estoque_utilizavel    
    let message = this.dataInfo.titleTicketInvalid + moment(data.data_log_venda).add(data.horas_porta_acesso, 'hours').format("LLL");

    this.showError(this.dataInfo.accessDenied, message, id_estoque_utilizavel)    
  }

  ticketAccessTimeDoorNotOkNotUsedContinue(ticket){      
    let data = ticket.success[0].result[0]  
    let id_estoque_utilizavel = data.id_estoque_utilizavel
    let data_log_utilizacao = data.data_log_utilizacao
    
    let message = 'Tempo máximo de uso excedido: ' + moment(data_log_utilizacao).format("LLL");             
        
    this.showError(this.dataInfo.accessDenied, message, id_estoque_utilizavel)    
  }

  ticketAccessSameDayNotOk(ticket){       
    let data = ticket.success[0].result[0]
    let id_estoque_utilizavel = data.id_estoque_utilizavel

    let message = this.dataInfo.titleTicketInvalid + moment(data.data_log_venda).format("LLL");
    this.showError(this.dataInfo.accessDenied, message, id_estoque_utilizavel)    
  }

  ticketAccessCountPassNotOk(ticket){
    this.ticketAlreadUsedFinish(ticket)
  }

  ticketAlreadUsedFinish(ticket){   
    
    let data = ticket.success[0].result[0]
    let id_estoque_utilizavel = data.id_estoque_utilizavel
    let nome_ponto_acesso = data.nome_ponto_acesso

    this.statusTicketStart = moment(data.data_log_utilizacao).format("LL");      ;
    let message = this.dataInfo.ticketAlreadyUsed + ' - ' + nome_ponto_acesso + '- ' + this.statusTicketStart
    this.showError(this.dataInfo.accessDenied, message, id_estoque_utilizavel)    
  }  

  useTicket(ticket){        
    
    if(this.idTypeBackgrond === this.dataInfo.backgroundIdSearch){    
      this.searchOkContinue(ticket)    

    } else {                  

      let self = this

      console.log('Utilizando ticket', ticket)

      this.http.useTicket(ticket).subscribe( data => {
        self.useTicketEnd(data, ticket)              
      })
    }    
  }

  searchOkContinue(ticket){
    console.log("Procurando mais informações sobre ingresso:", ticket)

    this.http.checkTicketQuick(ticket).subscribe(data =>{
        this.searchOkCallback(data)
    })      
  }

  searchOkCallback(ticket){    
    this.ticketRead = true
    this.idTypeBackgrond = this.dataInfo.backgroundIdSearchOk                   
    this.historyText1 = this.dataInfo.ticketOk
    this.historyText2 = ""
    this.historyText3 = ""
    let pontos = "";

    ticket.success.forEach(element => {

      let validity = element.fk_id_validade

      if(validity <= 2)
        this.historyText2 = moment(element.data_log_venda).format("LL")    
       
      pontos += " - " + element.nome_ponto_acesso 

    });

    this.historyText3 = pontos        
    this.backHome()   
  }
  
  useTicketEnd(data, ticket){    
    
    let productType = ''
    let productSubType = ''
    this.ticketRead = true
    this.dataInfo.ticketRead = this.dataInfo.ticketReadDefault  
    this.history = this.dataInfo.ticketRead + ticket

    data.success.forEach(element => {      

      if(this.dataInfo.ativaRedeOnline){

        productType = element.nome_produto_peq
        productSubType = element.nome_subtipo_produto
        
      } else {

        productType = element.result[0].nome_produto_peq
        productSubType =  element.result[0].nome_subtipo_produto
      }
      
    });
    
    let msg = productType + " - " + productSubType

    this.statusTicket = this.dataInfo.ticketOk
    this.idTypeBackgrond = this.dataInfo.backgroundIdGreen    
    this.message1 = this.dataInfo.welcomeMsg              
    this.message2 = msg
    this.incrementCounter()
    this.showGpioSuccess()

    setTimeout(() => {
      this.backHome()    
    }, this.dataInfo.timeMessage)
  }

  setMultiple(){          
    this.navCtrl.push('Multiple')      
  }      

  openGateIn(){
    this.http.systemCommand(1, 1, this.dataInfo.receptorOne)
    .subscribe( () => {
      
      this.uiUtils.showAlert(this.dataInfo.sucess, this.dataInfo.titleCommandSuccess).present()
      .then( () => {
        this.goPDVi()
      })
    })
  }

  openGateOut(){
    this.http.systemCommand(1, 1, this.dataInfo.receptorTwo)
    .subscribe( () => {
      
      this.uiUtils.showAlert(this.dataInfo.sucess, this.dataInfo.titleCommandSuccess).present()
      .then( () => {
        this.goPDVi()
      })
    })
  }

  goPDVi(){
    this.http.goPDVi()
  }

}