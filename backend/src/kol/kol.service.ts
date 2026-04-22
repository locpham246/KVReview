import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateKolDto } from './dto/create-kol.dto';
import { UpdateKolDto } from './dto/update-kol.dto';

@Injectable()
export class KolService {
  constructor(private prisma: PrismaService) { }

  create(createKolDto: CreateKolDto) {
    return this.prisma.kol.create({ data: createKolDto as any });
  }

  findAll() {
    return this.prisma.kol.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.kol.findUnique({ where: { id } });
  }

  update(id: string, updateKolDto: UpdateKolDto) {
    return this.prisma.kol.update({
      where: { id },
      data: updateKolDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.kol.delete({ where: { id } });
  }
}
