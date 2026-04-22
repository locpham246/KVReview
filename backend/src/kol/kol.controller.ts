import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KolService } from './kol.service';
import { CreateKolDto } from './dto/create-kol.dto';
import { UpdateKolDto } from './dto/update-kol.dto';

@Controller('kol')
export class KolController {
  constructor(private readonly kolService: KolService) { }

  @Post()
  create(@Body() createKolDto: CreateKolDto) {
    return this.kolService.create(createKolDto);
  }

  @Get()
  findAll() {
    return this.kolService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kolService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKolDto: UpdateKolDto) {
    return this.kolService.update(id, updateKolDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kolService.remove(id);
  }
}
