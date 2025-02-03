import { Controller, Get } from '@nestjs/common';
import { TcpService } from './tcp.service';

@Controller('tcp')
export class TcpController {
  constructor(private readonly tcpService: TcpService) {}

  @Get('start-server')
  startTcpServer() {
    this.tcpService.startServer();
    return 'Servidor TCP iniciado';
  }

  @Get('stop-server')
  stopTcpServer() {
    this.tcpService.stopServer();
    return 'Servidor TCP detenido';
  }
}
