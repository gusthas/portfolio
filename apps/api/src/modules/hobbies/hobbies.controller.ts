import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { type Hobby, HobbyType } from '@prisma/client';

import { HobbiesService } from './hobbies.service';

@ApiTags('Hobbies')
@Controller('hobbies')
export class HobbiesController {
  constructor(private readonly hobbies: HobbiesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os hobbies' })
  @ApiQuery({ name: 'type', enum: HobbyType, required: false })
  async findAll(@Query('type') type?: HobbyType): Promise<Hobby[]> {
    if (type) return this.hobbies.findByType(type);
    return this.hobbies.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna um hobby pelo ID' })
  async findOne(@Param('id') id: string): Promise<Hobby> {
    return this.hobbies.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um hobby (protegido — requer auth)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.hobbies.remove(id);
  }
}
