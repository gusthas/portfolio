import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { type Skill, SkillCategory } from '@prisma/client';

import { SkillsService } from './skills.service';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as skills' })
  @ApiQuery({ name: 'category', enum: SkillCategory, required: false })
  async findAll(@Query('category') category?: SkillCategory): Promise<Skill[]> {
    if (category) return this.skills.findByCategory(category);
    return this.skills.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna uma skill pelo ID' })
  async findOne(@Param('id') id: string): Promise<Skill> {
    return this.skills.findOne(id);
  }
}
