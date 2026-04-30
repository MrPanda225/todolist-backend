import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateUserDto }   from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async getMe(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    try {
      return await this.repo.update(userId, dto);
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException("Ce nom d'utilisateur est déjà utilisé");
      throw e;
    }
  }
}