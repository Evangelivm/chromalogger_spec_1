import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TcpService } from './tcp.service';

@Injectable()
export class ConnectionManagerService implements OnModuleInit, OnModuleDestroy {
  private activeService: 'tcp' | null = null;

  constructor(private readonly tcpService: TcpService) {}

  async onModuleInit() {
    console.log('ConnectionManager iniciado');
    this.tryConnectServices();
  }

  async onModuleDestroy() {
    console.log('Desactivando servicios...');
    if (this.activeService === 'tcp') {
      this.tcpService.disconnect();
    }
  }

  private async tryConnectServices() {
    console.log('Intentando conectar a TCP...');

    // Intentar conectar a TCP
    const tcpConnected = await this.tcpService.connect();
    if (tcpConnected) {
      this.activeService = 'tcp';
      console.log('TCP conectado exitosamente.');
    } else {
      console.error('No se pudo conectar a TCP');
    }
  }
}
