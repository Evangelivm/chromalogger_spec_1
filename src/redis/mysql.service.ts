import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { codeMap } from '../tcp/code-map';

@Injectable()
export class MysqlService {
  constructor(private prisma: PrismaService) {}

  async insertData(data: string[]) {
    if (data.length === 0) return;

    const parsedData = data.map((item) => JSON.parse(item));

    const records = parsedData.flatMap((entry) =>
      entry.dataGroup.map((item) => {
        const record = {};
        // Usar db_name para el almacenamiento en la base de datos
        Object.entries(codeMap).forEach(([_, value]) => {
          record[value.db_name] = item[value.db_name];
        });
        record['time'] = item.time;
        record['data'] = item.data;
        return record;
      }),
    );

    try {
      await this.prisma.test_record.createMany({
        data: records,
        skipDuplicates: true,
      });

      console.log('\x1b[32m%s\x1b[0m', 'Data inserted');
    } catch (error) {
      console.error('Error al insertar datos:', error);
    }
  }
}
