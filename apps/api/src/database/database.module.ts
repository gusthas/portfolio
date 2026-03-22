import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * DATABASE MODULE
 *
 * @Global() faz com que o PrismaService seja disponível em TODOS os módulos
 * sem precisar importar DatabaseModule em cada um.
 *
 * Analogia: é como uma tomada elétrica — você não precisa instalar a usina
 * em cada cômodo, ela já está disponível em toda a casa.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
