import { Injectable } from '@nestjs/common';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';

@Injectable()
export class DataService {
  private previousData = {};

  constructor(private websocketGateway: WebsocketGateway) {}

  private codeMap = {
    '0108': 'DEPTH',
    '0110': 'HOLE_DEPTH',
    '0112': 'BLOCK_HEIGHT',
    '0113': 'ROP',
    '0114': 'HOOKLOAD',
    '0145': 'SLIPS',
    '0144': 'ON_BOTTOM',
    '0120': 'RPM',
    '0130': 'FLOW',
    '0121': 'SPP',
    '0123': 'SPM1',
    '0124': 'SPM2',
    '0116': 'WOB',
    '0118': 'TORQ',
    '0713': 'INC',
    '0714': 'AZM',
    '0715': 'AZMC',
    '0722': 'GTOT',
    '0723': 'BTOT',
    '0724': 'DIP',
    '0717': 'TF',
    '0823': 'GAM',
  };

  processData(data: string) {
    const result = {};

    // Inicializar todas las variables en null para este bloque de datos
    Object.keys(this.codeMap).forEach((code) => {
      result[this.codeMap[code]] = null;
    });

    // Procesar el string recibido
    const lines = data.split('\n').filter((line) => line.trim().length > 0);
    for (const line of lines) {
      const code = line.slice(0, 4);
      const value = line.slice(4).trim();

      if (this.codeMap[code]) {
        let processedValue = value;

        // Reemplazo específico para ON_BOTTOM y SLIPS
        if (
          this.codeMap[code] === 'ON_BOTTOM' ||
          this.codeMap[code] === 'SLIPS'
        ) {
          processedValue = value === '1' ? 'YES' : 'NO';
        }

        result[this.codeMap[code]] = processedValue;
        this.previousData[this.codeMap[code]] = processedValue;
      }
    }

    // Asegurar que siempre se envíen todos los valores retenidos desde previousData si no fueron enviados en este bloque
    Object.keys(this.previousData).forEach((key) => {
      if (result[key] === null) {
        result[key] = this.previousData[key];
      }
    });

    // Agregar la marca de tiempo al resultado
    const timestamp = new Date().toISOString();
    result['time'] = timestamp;

    const dataGroup = { dataGroup: [result] };

    // Emitir datos a través del WebSocket
    this.websocketGateway.emitData(dataGroup);

    return dataGroup;
  }
}
