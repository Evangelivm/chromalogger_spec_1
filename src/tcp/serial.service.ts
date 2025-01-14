import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SerialPort, ReadlineParser } from 'serialport';
import { DataService } from './data.service';
import { QueueService } from '../redis/queue.service';

@Injectable()
export class SerialService implements OnModuleInit, OnModuleDestroy {
  private port: SerialPort;
  private parser: ReadlineParser;
  private isReceivingData = false; // Bandera para verificar actividad
  private inactivityTimeout: NodeJS.Timeout;
  private readonly inactivityThreshold = 5000; // Tiempo de inactividad en ms
  private dataBuffer = '';

  constructor(
    private readonly dataService: DataService,
    private readonly queueService: QueueService,
  ) {}

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const portPath = process.env.SERIAL_PORT || '/dev/ttyUSB0';
      const baudRate = parseInt(process.env.BAUD_RATE || '9600', 10);

      this.port = new SerialPort(
        {
          path: portPath,
          baudRate: baudRate,
        },
        (err) => {
          if (err) {
            console.error(`Error opening serial port: ${err.message}`);
            return resolve(false);
          }
          console.log(`Serial port ${portPath} opened at ${baudRate} baud`);
          resolve(true);
        },
      );

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      this.port.on('close', () => {
        console.warn(`Serial port ${portPath} closed`);
        this.isReceivingData = false;
      });

      this.port.on('error', (err) => {
        console.error(`Error in serial port: ${err.message}`);
      });

      this.parser.on('data', async (data: string) => {
        this.isReceivingData = true;
        this.resetInactivityTimer();
        try {
          //console.log(`Received data: ${data}`);
          this.dataBuffer += data.trim() + '\n';

          // Check if the message ends with '!!'
          if (data.includes('!!')) {
            const processedData = this.dataService.processData(this.dataBuffer);
            const serializedData = JSON.stringify(processedData);
            await this.queueService.enqueueData([serializedData]);

            // Clear the buffer after processing
            this.dataBuffer = '';
          }
        } catch (error) {
          console.error('Error processing serial data:', error.message);
        }
      });
    });
  }

  disconnect() {
    if (this.port && this.port.isOpen) {
      this.port.close((err) => {
        if (err) {
          console.error(`Error closing serial port: ${err.message}`);
        } else {
          console.log('Serial port closed');
        }
      });
    }
  }

  private resetInactivityTimer() {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    this.inactivityTimeout = setTimeout(() => {
      if (this.isReceivingData) {
        this.isReceivingData = false;
      } else {
        console.log('No se ha recibido datos en un tiempo, desconectando...');
        this.disconnect();
      }
    }, this.inactivityThreshold);
  }
}
