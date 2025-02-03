import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TcpService } from './tcp.service';

@Injectable()
export class ConnectionManagerService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly tcpService: TcpService) {}

  async onModuleInit() {
    console.log('ConnectionManager iniciado');
    await this.waitForConnection(); // Esperar hasta que haya una conexión
    console.log('Conexión TCP establecida');
  }

  async onModuleDestroy() {
    console.log('Desactivando servicios...');
    this.tcpService.stopServer(); // Detener el servidor TCP
  }

  private async waitForConnection(): Promise<void> {
    return new Promise((resolve) => {
      // Escuchar el evento "connected" del TcpService
      this.tcpService.connectionEvent.once('connected', () => {
        resolve(); // Resolver la promesa cuando haya una conexión
      });
    });
  }
}
