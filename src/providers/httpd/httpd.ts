import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataInfoProvider } from '../../providers/data-info/data-info'

@Injectable()
export class HttpdProvider {
  
  address : string = ''
  totemId: number = 1    
        
  constructor(public http: HttpClient, public dataInfo: DataInfoProvider) {
    console.log('Hello HttpdProvider Provider');

    this.address = '/api'
    console.log("Endereço do servidor:", this.address)
    
    this.getTotemInfo().subscribe(data => {   
      this.dataInfo.configureTotem(data)
    })
  }  
  
  getTotemInfo(){
    let myData = JSON.stringify({id: this.dataInfo.totemId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/getTotemInfo", myData, {headers: headers})
  }

  getAreas(){
    let myData = JSON.stringify({id: this.dataInfo.totemId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/getAreas", myData, {headers: headers})
  }  

  getAreaInfo(idArea_){
    let myData = JSON.stringify({id: this.dataInfo.totemId, idArea: idArea_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/getAreaInfo", myData, {headers: headers})
  }

  getAreaCounter(idArea_){
    let myData = JSON.stringify({id: this.dataInfo.totemId, idArea: idArea_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/getAreaCounter", myData, {headers: headers})
  }

  decrementAreaCounter(idArea_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, idArea: idArea_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/decrementAreaCounter", myData, {headers: headers})
  }

  incrementAreaCounter(idArea_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, idArea: idArea_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/incrementAreaCounter", myData, {headers: headers})
  }

  checkTicketSold(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketIsSold", myData, {headers: headers})
  }

  checkTicket(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicket", myData, {headers: headers})
  }

  checkTicketMultiple(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketMultiple", myData, {headers: headers})
  }

  
  checkTicketQuick(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketQuick", myData, {headers: headers})
  }

  checkTicketExist(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketExist", myData, {headers: headers})
  }

  checkTicketOut(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketOut", myData, {headers: headers})
  }

  checkTicketExistMultiple(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketExistMultiple", myData, {headers: headers})
  }

  checkTicketContinue(value_){        
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketContinue", myData, {headers: headers})
  }

  checkTicketContinueMultiple(value_){        
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketContinueMultiple", myData, {headers: headers})
  }

  checkTicketUsed(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketUsed", myData, {headers: headers})    
  }

  checkTicketUsedSimple(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketUsedSimple", myData, {headers: headers})    
  }

  checkTicketUsedTotal(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketUsedTotal", myData, {headers: headers})    
  }

  useTicket(value_){
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/useTicket", myData, {headers: headers})
  }

  useTicketMemory(value_){
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/useTicketMemory", myData, {headers: headers})
  }

  useTicketMultiple(value_){
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/useTicketMultiple", myData, {headers: headers})
  }

  checkMultipleTickets(start_, end_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticketStart: start_, ticketEnd: end_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkMultipleTickets", myData, {headers: headers})
  }
  
  activeGpioSuccess(){
    let myData = JSON.stringify({id: this.dataInfo.totemId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/activeGpioSuccess", myData, {headers: headers})
  }

  activeGpioError(){
    let myData = JSON.stringify({id: this.dataInfo.totemId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/activeGpioError", myData, {headers: headers})
  }

  /**
   * COMANDOS RECEPTOR
   */
 
  systemCommand(command_: number, idUser_: number, ipPonto_: string){   
    let myData = JSON.stringify({id: this.totemId, idUser: idUser_, cmd: command_, ipPonto: ipPonto_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/systemCommand", myData, {headers: headers})
  }

  /**
   * COMANDOS TOTEM DE ACESSO
   */

  goPDVi(){
    let myData = JSON.stringify({id: 1});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/goPDVi", myData, {headers: headers})
  }

  /**
   * LISTA BRANCA
   */

  getListaBranca(){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, idArea: this.dataInfo.areaId, idPorta: this.dataInfo.portaId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/getListaBranca", myData, {headers: headers})
  }
 
}