import { Injectable }    from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly publicSelect = {
    id: true, username: true, email: true,
    firstName: true, lastName: true, createdAt: true,
  };

  findById(id: string) {
    return this.prisma.user.findUnique({
      where:  { id },
      select: this.publicSelect,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  create(data: { username: string; email: string; passwordHash: string; firstName: string; lastName: string }) {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where:  { id },
      data,
      select: this.publicSelect,
    });
  }
}