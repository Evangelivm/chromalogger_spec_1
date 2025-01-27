import { Controller, Get } from '@nestjs/common';
import { TcpService } from './tcp.service';

@Controller('tcp')
export class TcpController {
  constructor(private readonly tcpService: TcpService) {}

  @Get('start-tcp')
  startTcpConnection() {
    this.tcpService.connect();
    return 'Conexión TCP iniciada';
  }

  @Get('stop-tcp')
  stopTcpConnection() {
    this.tcpService.disconnect();
    return 'Conexión TCP detenida';
  }
}
