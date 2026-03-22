import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { type Hobby, HobbyType } from '@prisma/client';

import { CacheService } from '../../cache/cache.service';
import { PrismaService } from '../../database/prisma.service';

export interface CreateHobbyDto {
  type: HobbyType;
  title: string;
  coverUrl?: string;
  description?: string;
  personalImpact?: string;
  lessonsLearned?: string;
  thinkingStyle?: string;
  rating?: number;
  completed?: boolean;
  completedAt?: Date;
  externalId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class HobbiesService {
  private readonly logger = new Logger(HobbiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(): Promise<Hobby[]> {
    return this.cache.getOrSet(
      'hobbies:all',
      () => this.prisma.hobby.findMany({ orderBy: { createdAt: 'desc' } }),
      CacheService.TTL.MEDIUM,
    );
  }

  async findByType(type: HobbyType): Promise<Hobby[]> {
    return this.cache.getOrSet(
      `hobbies:type:${type}`,
      () =>
        this.prisma.hobby.findMany({
          where: { type },
          orderBy: [{ rating: 'desc' }, { completedAt: 'desc' }],
        }),
      CacheService.TTL.MEDIUM,
    );
  }

  async findOne(id: string): Promise<Hobby> {
    const hobby = await this.prisma.hobby.findUnique({ where: { id } });
    if (!hobby) throw new NotFoundException(`Hobby ${id} não encontrado`);
    return hobby;
  }

  async create(dto: CreateHobbyDto): Promise<Hobby> {
    const hobby = await this.prisma.hobby.create({ data: dto });
    await this.cache.delByPattern('hobbies:*');
    this.logger.log(`Hobby criado: ${hobby.title}`);
    return hobby;
  }

  async update(id: string, dto: Partial<CreateHobbyDto>): Promise<Hobby> {
    await this.findOne(id); // throws se não encontrar
    const updated = await this.prisma.hobby.update({ where: { id }, data: dto });
    await this.cache.delByPattern('hobbies:*');
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.hobby.delete({ where: { id } });
    await this.cache.delByPattern('hobbies:*');
  }
}
