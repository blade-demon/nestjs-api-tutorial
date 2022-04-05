import * as argon from 'argon2';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    console.log({
      dto,
    });
    // 生成密码的hash
    const hash = await argon.hash(dto.password);
    // 保存新生成的用户信息
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credential taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // 通过email查找用户
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('Credential incorrect');
    // 比较密码
    const pwdMatches = await argon.verify(user.hash, dto.password);
    // 密码不正确抛出异常
    if (!pwdMatches) throw new ForbiddenException('Credential incorrect');

    delete user.hash;
    // 返回用户
    return user;
  }
}
