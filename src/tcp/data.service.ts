import { Injectable } from '@nestjs/common';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { codeMap } from './code-map';
import { create } from 'xmlbuilder2';

@Injectable()
export class DataService {
  private previousData = {};

  constructor(private websocketGateway: WebsocketGateway) {}

  private codeMap = codeMap;

  processData(data: string) {
    const result = {};

    // Inicializar todas las variables en null para este bloque de datos
    Object.keys(this.codeMap).forEach((code) => {
      result[this.codeMap[code].db_name] = null;
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
          this.codeMap[code].db_name === 'ON_BOTTOM' ||
          this.codeMap[code].db_name === 'SLIPS'
        ) {
          processedValue = value === '1' ? 'YES' : 'NO';
        }

        result[this.codeMap[code].db_name] = processedValue;
        this.previousData[this.codeMap[code].db_name] = processedValue;
      }
    }

    // Asegurar que siempre se envíen todos los valores retenidos desde previousData
    Object.keys(this.previousData).forEach((key) => {
      if (result[key] === null) {
        result[key] = this.previousData[key];
      }
    });

    // Obtener el nombre del pozo desde las variables de entorno
    const wellName = process.env.WELL_NAME || 'Default Well Name';
    const wellboreName = process.env.WELLBORE_NAME || 'Default Wellbore Name';

    // Generar el XML usando xmlbuilder2 de manera dinámica
    const xml = create({ version: '1.0' })
      .ele('witsml', { version: '1.4.1.1' })
      .ele('well')
      .ele('name')
      .txt(wellName)
      .up()
      .ele('wellbore')
      .ele('name')
      .txt(wellboreName)
      .up()
      .ele('log');

    // Agregar dinámicamente los elementos del resultado al XML usando wits_name
    Object.keys(this.codeMap).forEach((code) => {
      const { db_name, wits_name } = this.codeMap[code];
      if (db_name !== 'time' && db_name !== 'data') {
        xml
          .ele(wits_name, { uom: 'm' })
          .txt(result[db_name] || '')
          .up();
      }
    });

    const xmlString = xml
      .up()
      .up()
      .up()
      .end({ prettyPrint: false, headless: true, indent: ' ' });

    // Agregar el XML al resultado
    result['data'] = xmlString;

    // Agregar la marca de tiempo al resultado
    const timestamp = new Date().toISOString();
    result['time'] = timestamp;

    const dataGroup = { dataGroup: [result] };

    // Emitir datos a través del WebSocket
    this.websocketGateway.emitData(dataGroup);

    return dataGroup;
  }
}
