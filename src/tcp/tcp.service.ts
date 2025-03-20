import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket, createServer } from 'net';
import { EventEmitter } from 'events';
import { DataService } from './data.service';
import { QueueService } from '../redis/queue.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class TcpService implements OnModuleInit, OnModuleDestroy {
  private server: Server;
  private clients: Socket[] = []; // Lista de clientes conectados
  private readonly port = parseInt(process.env.TCP_PORT || '1234', 10);
  public connectionEvent = new EventEmitter(); // EventEmitter para notificar conexiones

  constructor(
    private readonly dataService: DataService,
    private readonly queueService: QueueService,
  ) {}

  onModuleInit() {
    this.startServer();
  }

  onModuleDestroy() {
    this.stopServer();
  }

  startServer(): void {
    this.server = createServer((socket: Socket) => {
      console.log(
        'Cliente conectado:',
        socket.remoteAddress,
        socket.remotePort,
      );

      // Agregar el cliente a la lista
      this.clients.push(socket);

      // Notificar que hay una nueva conexión
      this.connectionEvent.emit('connected');

      // Manejar datos recibidos del cliente
      socket.on('data', async (data) => {
        try {
          const receivedData = data.toString();
          //console.log('Datos recibidos:', receivedData);

          // Procesar los datos
          const processedData = this.dataService.processData(receivedData);

          // Enviar los datos procesados a Redis (opcional)
          const serializedData = JSON.stringify(processedData);
          await this.queueService.enqueueData([serializedData]);

          // Retransmitir el XML a todos los clientes conectados (excepto al que envió los datos)
          const xmlData = processedData.dataGroup[0]['data'];
          this.broadcastData(xmlData, socket);
        } catch (error) {
          console.error(
            'Error procesando los datos o enviando a Redis:',
            error.message,
          );
        }
      });

      // Manejar la desconexión del cliente
      socket.on('end', () => {
        console.log(
          'Cliente desconectado:',
          socket.remoteAddress,
          socket.remotePort,
        );
        this.clients = this.clients.filter((client) => client !== socket); // Eliminar el cliente de la lista
      });

      // Manejar errores del cliente
      socket.on('error', (err) => {
        console.error('Error en la conexión con el cliente:', err.message);
        this.clients = this.clients.filter((client) => client !== socket); // Eliminar el cliente de la lista
      });
    });

    // Escuchar en el puerto especificado
    this.server.listen(this.port, '0.0.0.0', () => {
      console.log(`Servidor TCP escuchando en el puerto ${this.port}`);
    });

    // Manejar errores del servidor
    this.server.on('error', (err) => {
      console.error('Error en el servidor TCP:', err.message);
    });
  }

  stopServer(): void {
    if (this.server) {
      // Cerrar todas las conexiones de clientes
      this.clients.forEach((client) => client.destroy());
      this.clients = [];

      // Cerrar el servidor
      this.server.close(() => {
        console.log('Servidor TCP detenido');
      });
    }
  }

  // Método para retransmitir datos a todos los clientes conectados (excepto al que envió los datos)
  private broadcastData(data: string, senderSocket: Socket): void {
    this.clients.forEach((client) => {
      if (client !== senderSocket && !client.destroyed) {
        client.write(data); // Enviar los datos al cliente
      }
    });
  }
}
