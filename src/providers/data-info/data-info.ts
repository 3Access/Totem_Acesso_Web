import { Injectable } from '@angular/core';
import { ConfigurationService } from "ionic-configuration-service";
import { Events } from 'ionic-angular';

@Injectable()
export class DataInfoProvider {
  
  infoTotem: any;
  areaId: number =  0  
  portaId: number =  0  
  totemId: number =  0
  totemSaida: number = 0  
  addressServer: string = "/api";
  tipoPontoAcesso: number = 1;
  timeMessage: number = 3000
  timeMessageHistory: number = 6000
  maxTicketsMultiple: number = 100

  receptorOneEnabled: number = 0
  receptorTwoEnabled: number = 0
  receptorOne: string
  receptorTwo: string
  
  backgroundIdGreen: number = 1
  backgroundIdRed: number = 2
  backgroundIdNone: number = 3
  backgroundIdSearch: number = 4
  backgroundIdSearchOk: number = 5
  backgroundIdSearchNotOk: number = 6
  backgroundIdTicketRead: number = 7
    
  history: string = "Histórico do ingresso"  
  titleTicketInvalid: string = "Ingresso vencido. Limite: "
  historyGeneral: string = "Histórico do ingresso"  
  historyUntilDay: string = "Até dia"  
  historyUsedDay: string = "Usado dia"
  accessPoints: string = "Acesso aos pontos"
  alreadyOk: string = "Utilizado com sucesso"
  already: string = "Já utilizado"
  alreadyMsg: string = "10/05/2018 - 10:35 - Chapelaria"
  ticketOld: string = "Ingresso vencido"
  ticketOldMsg: string = "10/05/2018 - 10:35"
  ticketNotRegistered: string = "Ingresso não cadastrado"
  ticketNotRegisteredMsg: string = "Ingresso não cadastrado"
  ticketNotSolded: string = "Não vendido"
  ticketNotSoldedMsg: string = "Ingresso não foi vendido"
  ticketOk: string = "Ingresso válido"  
  ticketNotOk: string = "Ingresso inválido"  
  isLoading: string =  "Carregando"
  titleGeneral: string = "Carregando"
  ticketNotAllowed: string = "Área não permitida"
  titleTicketAllowedAccessPoints: string = "- Acesso aos pontos: "
  titleDateSaleNotExist: string = "'Ticket inexistente'"
  titleProcessFinished: string = "Processo finalizado"
  welcomeMsg: string = "Seja bem vindo!"
  goodByeMsg: string = "Volte sempre!"  
  pleaseWait: string = "Favor aguarde"
  atention: string = "Atenção"   
  ticketReadDefault: string = "Ingresso lido: "   
  ticketRead: string = "Ingresso lido: "      
  usedDay: string = "Utilizado dia"   
  ticketStart: string = "Ingresso inicial"  
  ticketEnd: string = "Ingresso final"  
  send: string = "Enviar"      
  sucess: string = "Sucesso"
  titleCommandSuccess: string = "Comando enviado com sucesso!"
  erro: string = "Erro"
  noConfiguration: string = "Nenhuma configuraçao disponivel"  
  noResults: string = "Nenhum resultado"
  accessDenied: string = "Acesso negado"
  timeAccessOver: string = "Tempo de acesso vencido"
  accessCountLimitPassed: string = "Qtd. de acessos máximo utilizados"
  added: string = "Adicionado"  
  areYouSure: string = "Tem certeza disso?"    
  configuringTotem: string = 'Configurando totem'    
  ipNotFound: string = "IP não localizado"
  inicializedSuccessfully: string = 'Inicializado com sucesso!'
  configureYourSystem: string = 'Favor configurar sistema'
  searchingTicket: string = 'Procurando um ingresso:'
  ticketSize: string = "Tamanho: "
  checkingTicketExist: string = 'Verificando se existe:'
  checkingTicketSold: string = 'Verificando se foi vendido:'
  checkingTicketAccess: string = 'Verificando se possui acesso:'
  checkingValidity: string = 'Verificando validades:'
  checkingValiditySameDay: string = 'Verificando validade do mesmo dia'
  ticketExpired: string = 'Ingresso vencido: '
  checkingRulesDoores: string = 'Verificando regras das portas'
  ruleDoorUsed: string = 'Horas porta acesso ligado:'
  sameDayDoorRule: string = 'Mesmo dia acesso ligado:'
  accessOlnyRule: string = 'Unico acesso porta ligado:'
  numberAccessRule: string = 'Números de liberações ligado:'
  checkInvalid: string = 'Tipo de verificação inválida'
  checkingTimeAccess: string = 'Verificando tempo de acesso'
  checkingSameDayRule: string = 'Verificando acesso porta mesmo dia'
  checkingAccessCountRule: string = "Verificando quantidade de vezes utilizados: "
  ticketAlreadyUsed: string = 'Já utilizado em '
  usingTicket: string = 'Utilizando ticket:'
  ticketUsedSuccessFully: string = 'Ticket utilizado com sucesso!'
  startVerification: string = 'Iniciando verificação'
  checkInputs: string = 'Verificar os inputs'
  totalChecksMultiple: string = 'Total: '
  totalChecksMultipleOk: string = 'Válidos: '
  totalChecksMultipleNotOk: string = 'Inválidos: '

  ativaListaBranca: any
  ativaRedeOnline: any
  ativaHotspot: any
  ativaSincronizacaoUsb: any

  constructor(private configurationService: ConfigurationService, public events: Events) {        

    this.addressServer =  this.configurationService.getValue<string>("addressServer");
    this.timeMessage =  this.configurationService.getValue<number>("timeMessage");
    this.timeMessageHistory =  this.configurationService.getValue<number>("timeMessageHistory");
    this.maxTicketsMultiple =  this.configurationService.getValue<number>("maxTicketsMultiple");

    this.receptorOneEnabled =  this.configurationService.getValue<number>("receptorOneEnabled");
    this.receptorTwoEnabled =  this.configurationService.getValue<number>("receptorTwoEnabled");
    this.receptorOne =  this.configurationService.getValue<string>("receptorOneId");
    this.receptorTwo =  this.configurationService.getValue<string>("receptorTwoId");

    /*console.log('Endereço do servidor: ', this.addressServer)
    console.log('Tempo da mensagem: ', this.timeMessage)
    console.log('Tempo da mensagem no histórico: ', this.timeMessageHistory)
    console.log('Receptor 1 ativo: ', this.receptorOneEnabled)    
    console.log('Receptor 2 ativo: ', this.receptorTwoEnabled)    
    console.log('Receptor 1: ', this.receptorOne)    
    console.log('Receptor 2: ', this.receptorTwo)*/
  }  

  configureTotem(data){    

    this.infoTotem = data
    let self = this

      data.success.forEach(element => {

        console.log('Informações do banco de dados sobre o ponto: ', element)
        
        self.titleGeneral = element.nome_ponto_acesso
        self.totemId = element.fk_id_ponto_acesso
        self.areaId = element.fk_id_area_acesso
        self.portaId = element.id_porta_acesso        
        self.totemSaida = element.saida
      });          

    this.events.publish('totem:updated', data);    
      
  }


  

}
