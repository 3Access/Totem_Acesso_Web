import { Injectable } from '@angular/core';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';

@Injectable()
export class ListaBrancaProvider {

  allTickets: any = []
  listaBranca: any

  constructor(
    public http: HttpdProvider, 
    public dataInfo: DataInfoProvider,
    public events: Events,

    public storage: Storage) {    

      this.allTickets = []
      this.getOptionListaBranca()

      this.events.subscribe('totem:updated', (data) => {              
        this.startInterface()
      });            

      this.events.subscribe('update-lista-branca', (data) => {      
        this.atualizaLista()
      });            
  }

  startInterface(){

    this.getListBrancaStorage()

    .then( data => {      

      this.allTickets = data
      this.events.publish('lista-branca', data)
    })    
  }

  getListBrancaStorage(){

    return new Promise<any>((resolve) => { 

      let tickets = []
      
      this.storage.keys().then(data => {

        this.storage.forEach((value, key, index) => {                  
                          
          if(value && value.id_estoque_utilizavel){
            tickets.push(value)
          } 
  
          if (index === data.length -1){
            resolve(tickets)
          }
        })                    
      })
            
    });
  }


  getOptionListaBranca(){
    this.storage.get('ativaListaBranca')
    .then(data => {
        
        this.dataInfo.ativaListaBranca = data
        this.getOptionAtivaRede()
    })
  }

  getOptionAtivaRede(){
    this.storage.get('ativaRedeOnline')
    .then(data => {        
        this.dataInfo.ativaRedeOnline = data
        this.getOptionAtivaHotSpot()
    })
  }

  getOptionAtivaHotSpot(){
    this.storage.get('ativaHotspot')
    .then(data => {        
        this.dataInfo.ativaHotspot = data
        this.getOptionAtivaSincronizacao()
    })
  }

  getOptionAtivaSincronizacao(){
    this.storage.get('ativaSincronizacaoUsb')
    .then(data => {        
        this.dataInfo.ativaSincronizacaoUsb = data
        this.events.publish('listaBrancaConfig', true)
    })
  }
  
  atualizaLista()
  {
    this.http.getListaBranca()

    .subscribe(data => {

      this.getListaBrancaCallback(data)
    })
  }

  getListaBrancaCallback(data){

    let listaEstoque = []

    data.success.forEach(element => {    
      
      if(listaEstoque.indexOf(element.id_estoque_utilizavel) < 0){

        listaEstoque.push(element.id_estoque_utilizavel)
        this.storage.set(String(element.id_estoque_utilizavel), element)    

      }      
    });
  }

  getAllTickets(){
    return this.allTickets
  }
  
  getTicketInfo(ticket){

    return new Promise<any>((resolve, reject) => { 

      if(this.allTickets && this.allTickets.length > 0){

        this.allTickets.forEach(element => {

          let id_estoque_utilizavel = element.id_estoque_utilizavel          
  
          if(id_estoque_utilizavel === Number(ticket)){
            resolve(element)
          }          
  
        });              
      }
      
      resolve("Inexistente")
    });
  }

  buildCallback(data){
    let coitainer = {success: data}     
    this.events.publish('lista-branca-callback', coitainer)
  }


  searchOneTicket(ticket){
    
    let idTotem = this.dataInfo.totemId
    console.log('Totem: '+ idTotem + ' - Procurando informações do bilhete: ', ticket)

    this.getTicketInfo(ticket)

    .then(data => {       
      this.searchTicketContinue(data)        
    })       
  }  

  searchTicketContinue(data){
    
    let idTotem = this.dataInfo.totemId
    let unica_porta_acesso = data.unica_porta_acesso
    let horas_porta_acesso = data.horas_porta_acesso
    
    let utilizado = data.utilizado
    let unicaPortaUtilizado = unica_porta_acesso === 1 && utilizado === 1
    let horasPortaUtilizado = horas_porta_acesso >= 1 && utilizado === 1

    console.log('Data ticket: ', data)
      
    if(unicaPortaUtilizado || horasPortaUtilizado){      
    
      console.log('Totem: '+ idTotem + ' - Ticket já foi utilizado e regra só permite 1 entrada: ' + data.id_estoque_utilizavel)
      
      let callback = [{"callback": 10, "result": [data]}]      


      this.buildCallback(callback)
    }
    else {
    
      this.checkTicketValidity(data)
    }
  }

  checkTicketValidity(ticket){

    let idTotem = this.dataInfo.totemId
    let ticketstr = ticket.id_estoque_utilizavel   
    let mesmo_dia_validade = ticket.mesmo_dia_validade
    let infinito_validade = ticket.infinito_validade        

    console.log('Totem: '+ idTotem + ' - Verificando ticket validade: ' + ticketstr)
    
    if(mesmo_dia_validade == 1)
        this.ticketValiditySameDay(ticket)

    else if(infinito_validade == 1)
      this.ticketValidityInfinite(ticket)
    
    else 
      this.ticketValidityTime(ticket)
}

  ticketValiditySameDay(ticket){

    let idTotem = this.dataInfo.totemId
    let ticketstr = ticket.id_estoque_utilizavel   
    let data_log_venda = ticket.data_log_venda

    let now = moment().format()       

    let isSame = moment(data_log_venda).isSame(now, 'day')    
    console.log('Totem: '+ idTotem + ' - Verificando ticket validade mesmo dia: ' + ticketstr)    

    if(isSame)
        this.checkDoorRules(ticket)    

    else {
        let callback = [{"callback": 5, "result": [ticket]}]
        this.buildCallback(callback)
    }
}

  ticketValidityInfinite(ticket){
    
    let idTotem = this.dataInfo.totemId
    let ticketstr = ticket.id_estoque_utilizavel   

    console.log('Totem: '+ idTotem + ' - Verificando ticket validade infinita: ' + ticketstr)

    this.checkDoorRules(ticket)
 }

 ticketValidityTime(ticket: any) {
    const tempo = ticket.tempo_validade != null
      ? ticket.tempo_validade
      : 24;              // ← default 24 horas
    const venda = ticket.data_log_venda;

    // cria um moment a partir da data de venda
    const vendaMoment = moment(venda);
    // adiciona as horas de validade (ou 24h, se undefined)
    const expiraEm = vendaMoment.clone().add(tempo, 'hours');
    const agora = moment();

    console.log(
      `Totem: ${this.dataInfo.totemId} — expira em ${expiraEm.format()}, agora é ${agora.format()}`
    );

    if (agora.isBefore(expiraEm)) {
      console.log(
        `Totem: ${this.dataInfo.totemId} - Verificando ticket validade: ${ticket.id_estoque_utilizavel}`
      );
      this.checkDoorRules(ticket);
    } else {
      console.log(
        `Totem: ${this.dataInfo.totemId} - Ticket já foi utilizado e regra só permite 1 entrada: ${ticket.id_estoque_utilizavel}`
      );
      const callback = [{ callback: 6, result: [ticket] }];
      this.buildCallback(callback);
    }
  }



  checkDoorRules(ticket){

    let idTotem = this.dataInfo.totemId      
    let horas_porta_acesso = ticket.horas_porta_acesso
    let mesmo_dia_porta_acesso = ticket.mesmo_dia_porta_acesso
    let unica_porta_acesso = ticket.unica_porta_acesso
    let numero_liberacoes = ticket.numero_liberacoes

    console.log('Totem: '+ idTotem + ' - Configurações das regras de porta: ')
    console.log('Totem: '+ idTotem + ' - Horas Porta: ', horas_porta_acesso)    
    console.log('Totem: '+ idTotem + ' - Mesmo dia: ', mesmo_dia_porta_acesso)
    console.log('Totem: '+ idTotem + ' - Unica Porta: ', unica_porta_acesso)
    console.log('Totem: '+ idTotem + ' - Número de liberações: ', numero_liberacoes)
    

    if(horas_porta_acesso > 0){
      this.ticketAccessTimeDoor(ticket)
    }
    else if(mesmo_dia_porta_acesso > 0){
      this.ticketAccessSameDay(ticket)
    }
    else if(unica_porta_acesso > 0){
      this.ticketAccessOnlyone(ticket)
    }
    else if(numero_liberacoes > 0){
      this.ticketAccessCountPass(ticket)
    }    
    else {      
      console.log('Regra não localizada')
    }  
  }

  ticketAccessTimeDoor(data){


    let idTotem = this.dataInfo.totemId      
    let until =  moment(data.data_log_venda).add(data.horas_porta_acesso, 'hours').format();
    let now = moment().format()        
    
    let isAfter = moment(now).isAfter(until);
    console.log('Totem: '+ idTotem + ' - Verificando ticket validade tempo: ' + data.id_estoque_utilizavel + '. Agora é antes do tempo máximo? ' + isAfter)

    if(isAfter){

      let callback = [{"callback": 12, "result": [data]}]
      this.buildCallback(callback)    
    }
    else 
      this.useTicket(data)
  }


  ticketAccessSameDay(data){

    let idTotem = this.dataInfo.totemId      
    let ticket = data.id_estoque_utilizavel       

    let until =  moment(ticket.data_log_venda).format();
    let now = moment().format()                  
    let isSame = moment(until).isSame(now, 'day');    

    console.log('Totem: '+ idTotem + ' - Verificando utilização no mesmo dia: ' + data.id_estoque_utilizavel)

    if(isSame){
      this.useTicket(data)

    } else {


      let callback = [{"callback": 9, "result": [data]}]
      this.events.publish('lista-branca-callback', callback)

    }
  }

  ticketAccessOnlyone(data){

    let idTotem = this.dataInfo.totemId      
    console.log('Totem: '+ idTotem + ' - Verificando acesso único: ' + data.id_estoque_utilizavel)

    this.useTicket(data)
  }

  ticketAccessCountPass(data){

    let idTotem = this.dataInfo.totemId
    let numero_liberacoes = data.numero_liberacoes
      
    console.log('Totem: '+ idTotem + ' - Verificando contador de utilizações: ' + data.id_estoque_utilizavel + '. Número de liberações permitidas: ' + numero_liberacoes)
  
    if(! data.utilizacoes){
      this.useTicket(data)

    } else {
      
      let utilizacoes = data.utilizacoes

      if(utilizacoes.length > numero_liberacoes){

        let callback = [{"callback": 11, "result": [data]}]      
        this.buildCallback(callback)

      }
      else {
        this.useTicket(data)
        
      }
    }    
  }


  useTicket(ticket){            

    this.incrementUseTicket(ticket)
    .then(() => {

      this.useTicketEnd(ticket)
    })    
  }

  useTicketEnd(ticket){
    let callback = [{"callback": 100, "result": [ticket]}]
    this.buildCallback(callback)    
  }

  incrementUseTicket(ticket): Promise<void> {

    console.log('Adicionando nova entrada de utilização do bilhete: ', ticket.id_estoque_utilizavel)

    return new Promise<void>((resolve) => { 

      this.allTickets.forEach(element => {        

        if(element.id_estoque_utilizavel === ticket.id_estoque_utilizavel){
            element.utilizado = 1

            if(! element.utilizacoes){
              element.utilizacoes = []
            }
            
            element.utilizacoes.push(moment().format())

            this.storage.set(String(ticket.id_estoque_utilizavel), element)
            resolve(void 0)
        }
      });               
    });    
  }

  removeTicket(ticket){

    console.log(ticket)

    return new Promise<any>((resolve) => { 

      this.storage.remove(String(ticket.id_estoque_utilizavel))
      .then(data => {
        resolve(void 0)
      })
      
    });    
  }



}
