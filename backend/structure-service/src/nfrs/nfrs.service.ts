import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nfr } from './nfr.entity';
import { CreateNfrDto } from './dto/create-nfr.dto';

@Injectable()
export class NfrsService {
  constructor(
    @InjectRepository(Nfr)
    private readonly nfrsRepository: Repository<Nfr>,
  ) {}

  findAll(): Promise<Nfr[]> {
    return this.nfrsRepository.find({ order: { createdAt: 'ASC' } });
  }

  create(dto: CreateNfrDto): Promise<Nfr> {
    const nfr = this.nfrsRepository.create({
      category: dto.category,
      title: dto.title,
      description: dto.description ?? '',
      impactLevel: dto.impactLevel,
    });
    return this.nfrsRepository.save(nfr);
  }

  createMany(dtos: CreateNfrDto[]): Promise<Nfr[]> {
    const nfrs = dtos.map((dto) =>
      this.nfrsRepository.create({
        category: dto.category,
        title: dto.title,
        description: dto.description ?? '',
        impactLevel: dto.impactLevel,
      }),
    );
    return this.nfrsRepository.save(nfrs);
  }

  async remove(id: string): Promise<void> {
    const result = await this.nfrsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`NFR ${id} not found`);
    }
  }
}
