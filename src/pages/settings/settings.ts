import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ListaBrancaProvider } from '../../providers/lista-branca/lista-branca'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { Storage } from '@ionic/storage';
import { MemoryListPage } from '../../pages/memory-list/memory-list';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { Events } from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
//import { File } from '@ionic-native/file';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {ticket    

  allTickets: any  = [];
  memoryList: any

  ativaListaBranca: Boolean = false
  ativaRedeOnline: Boolean = true
  ativaHotspot: Boolean = false
  ativaSincronizacaoUsb: Boolean = false

  constructor(public navCtrl: NavController, 
    public listaBranca: ListaBrancaProvider,
    public uiUtils: UiUtilsProvider,     
    public dataInfo: DataInfoProvider,
    public storage: Storage,
    //private file: File,
    public http: HttpdProvider,
    public events: Events,
    public navParams: NavParams) {      
  }

  ionViewDidLoad() {
    
    this.events.subscribe('listaBrancaConfig', () => {
      this.listaBrancaConfigIsOk()
    });

    this.events.subscribe('lista-branca', data => {
      this.allTickets = data
    });    

    this.listaBrancaConfigIsOk()
  }
    
  listaBrancaConfigIsOk(){
    this.ativaListaBranca = this.dataInfo.ativaListaBranca
    this.ativaRedeOnline = this.dataInfo.ativaRedeOnline
    this.ativaHotspot = this.dataInfo.ativaHotspot
    this.ativaSincronizacaoUsb = this.dataInfo.ativaSincronizacaoUsb
  }

  saveConfiguration(){
      this.storage.set('ativaListaBranca', this.ativaListaBranca)
      this.storage.set('ativaRedeOnline', this.ativaRedeOnline)
      this.storage.set('ativaHotspot', this.ativaHotspot)
      this.storage.set('ativaSincronizacaoUsb', this.ativaSincronizacaoUsb)

      this.dataInfo.ativaListaBranca = this.ativaListaBranca
      this.dataInfo.ativaRedeOnline = this.ativaRedeOnline
      this.dataInfo.ativaHotspot = this.ativaHotspot
      this.dataInfo.ativaSincronizacaoUsb = this.ativaSincronizacaoUsb

      this.uiUtils.showAlert('Sucesso', 'Configurações gravadas com sucesso')
      .present()
  }

  unselectAll(mode: string){

    if(mode === 'ativaListaBranca'){      

      this.ativaRedeOnline = false
      this.ativaHotspot = false
      this.ativaSincronizacaoUsb = false  
    }

    else if(mode === 'ativaRedeOnline'){      

      this.ativaListaBranca = false
      this.ativaHotspot = false
      this.ativaSincronizacaoUsb = false  
    }

    else if(mode === 'ativaHotspot'){      

      this.ativaListaBranca = false
      this.ativaRedeOnline = false
      this.ativaSincronizacaoUsb = false  
    }

    else {
      this.ativaListaBranca = false
      this.ativaRedeOnline = false
      this.ativaHotspot = false      
    }        
  }

  startMemoryList(){

    this.uiUtils.showConfirm('Atenção', 'Deseja baixar a lista? Os dados atuais serão atualizados pelos valores obtidos no banco de dados')

    .then(res => {

      if(res){
        this.events.publish('update-lista-branca', true)
        this.uiUtils.showToast('Atualizado com sucesso')
      }
    })    
  }

  getMemoryList(){    
    this.navCtrl.push(MemoryListPage, {isMemoryList: false, allTickets: this.listaBranca.allTickets})    
  }

  getMemoryListMem(){
    this.navCtrl.push(MemoryListPage, {isMemoryList: true, allTickets: this.listaBranca.allTickets})    
  }

  removeAll(){
    this.uiUtils.showConfirm('Atenção', 'Deseja realmente limpar a lista?')

    .then(res => {

      if(res){
        this.removeAllContinue()
        this.uiUtils.showAlert('Sucesso', 'Lista removida com sucesso')
      }
    })
  }

  removeAllContinue(){     

    this.storage.forEach((value, key, index) => {
        
      if(value && value.id_estoque_utilizavel){
        this.storage.remove(key)
      } 
    })    

  }

  sincronize(){

    this.uiUtils.showConfirm('Atenção', 'Deseja sincronizar os dados?')

    .then(res => {

      if(res){
        this.sincronizeContinue()
      }
    })
  }


  sincronizeContinue(){
    let data = this.listaBranca.getAllTickets()
    data.forEach(element => {

      if(element.utilizacoes){
          this.useTicket(element)
      }
    });
  }

  useTicket(element){
    
    this.http.useTicketMemory(element)
    .subscribe(data => {

      console.log('Bilhete sincronizado com sucesso: ', element.id_estoque_utilizavel)

      element.utilizado = 0
      element.utilizacoes = []

      this.storage.set(String(element.id_estoque_utilizavel), element)
    })
  }

  getTicketsTxt(){
    return String(this.allTickets)
  }

  exportMemory(){
    this.uiUtils.showConfirm('Atenção', 'Deseja exportar os dados?')

    .then(res => {

      if(res){
        //this.events.publish('update-lista-branca', true)
        this.uiUtils.showAlert('Ops', 'Em desenvolvimento').present()
      }
    })
  }

  importMemory(){
    this.uiUtils.showConfirm('Atenção', 'Deseja importar os dados?')

    .then(res => {

      if(res){
        //this.events.publish('update-lista-branca', true)
        this.uiUtils.showAlert('Ops', 'Em desenvolvimento').present()
      }
    })
  }



}
