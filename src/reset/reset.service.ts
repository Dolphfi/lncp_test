import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reset } from './entities/reset.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ResetService {
  constructor(@InjectRepository(Reset) private readonly resetRepository: Repository<Reset>){}

  async save(body){
    return this.resetRepository.save(body);
  }

  async findOne(token: string): Promise<Reset | undefined> {
    return this.resetRepository.findOne({ where: { token } });
  }

}
