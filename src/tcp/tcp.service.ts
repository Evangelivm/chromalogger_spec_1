import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Socket } from 'net';
import { DataService } from './data.service';
import { QueueService } from '../redis/queue.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class TcpService implements OnModuleInit, OnModuleDestroy {
  private client: Socket;
  private readonly reconnectInterval = 2500; // Tiempo de espera antes de intentar reconectar (en ms)
  private isConnected = false; // Bandera para verificar si está conectado
  private isReceivingData = false; // Bandera para verificar actividad
  private inactivityTimeout: NodeJS.Timeout;
  private readonly inactivityThreshold = 5000; // Tiempo de inactividad en ms
  private reconnectTimeout: NodeJS.Timeout | null = null;

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
    return new Promise((resolve) => {
      this.client = new Socket();

      // Obtén el host y el puerto desde las variables de entorno, con valores por defecto
      const host = process.env.TCP_HOST || '127.0.0.1';
      const port = parseInt(process.env.TCP_PORT || '1234', 10);

      const tryConnect = () => {
        if (this.isConnected) return; // Evita múltiples intentos si ya está conectado

        this.client.connect(port, host, () => {
          console.log(`Datalogger connected in ${host}:${port}`);
          this.isConnected = true;
          this.resetInactivityTimer();
          resolve(true);
        });
      };

      tryConnect();

      // Evento para intentar reconectar en caso de desconexión
      this.client.on('close', () => {
        if (!this.isConnected) return; // Evita múltiples intentos si ya está desconectado
        console.log('Conexión cerrada, intentando reconectar...');
        this.isConnected = false;
        this.reconnectTimeout = setTimeout(tryConnect, this.reconnectInterval);
      });

      // Maneja los datos recibidos
      this.client.on('data', async (data) => {
        this.isReceivingData = true;
        this.resetInactivityTimer();
        try {
          const receivedData = data.toString();
          const processedData = this.dataService.processData(receivedData);

          const serializedData = JSON.stringify(processedData);
          await this.queueService.enqueueData([serializedData]);
        } catch (error) {
          console.error(
            'Error procesando los datos o enviando a Redis:',
            error.message,
          );
        }
      });

      // Maneja errores de conexión y reconexión en caso de fallo
      this.client.on('error', (err) => {
        console.error(`Error en la conexión: ${err.message}`);
        if (this.isConnected) {
          this.isConnected = false;
          this.reconnectTimeout = setTimeout(
            tryConnect,
            this.reconnectInterval,
          );
        }
      });

      // Resolver false si no se puede conectar
      this.client.on('error', () => resolve(false));
    });
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.client) {
      this.client.end(); // Cierra la conexión TCP
      this.isConnected = false;
      console.log('Conexión cerrada');
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
