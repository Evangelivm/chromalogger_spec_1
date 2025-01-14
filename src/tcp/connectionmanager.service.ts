import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TcpService } from './tcp.service';
import { SerialService } from './serial.service';

@Injectable()
export class ConnectionManagerService implements OnModuleInit, OnModuleDestroy {
  private activeService: 'tcp' | 'serial' | null = null;

  constructor(
    private readonly tcpService: TcpService,
    private readonly serialService: SerialService,
  ) {}

  async onModuleInit() {
    console.log('ConnectionManager iniciado');
    this.tryConnectServices();
  }

  async onModuleDestroy() {
    console.log('Desactivando servicios...');
    if (this.activeService === 'tcp') {
      this.tcpService.disconnect();
    } else if (this.activeService === 'serial') {
      this.serialService.disconnect();
    }
  }

  private async tryConnectServices() {
    console.log('Intentando conectar a TCP y Serial...');

    // Intentar conectar a TCP primero
    const tcpConnected = await this.tcpService.connect();
    if (tcpConnected) {
      this.activeService = 'tcp';
      console.log('TCP conectado exitosamente.');
      return;
    }

    // Si TCP falla, intentar conectar a Serial
    const serialConnected = await this.serialService.connect();
    if (serialConnected) {
      // Desactivar reconexión de TCP si se conecta a Serial
      this.tcpService.disconnect();
      this.activeService = 'serial';
      console.log('Serial conectado exitosamente.');
    } else {
      console.error('No se pudo conectar a TCP ni a Serial');
    }
  }
}
