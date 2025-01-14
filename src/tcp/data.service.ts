import { Injectable } from '@nestjs/common';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { codeMap } from './code-map';

@Injectable()
export class DataService {
  private previousData = {};

  constructor(private websocketGateway: WebsocketGateway) {}

  private codeMap = codeMap;

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
