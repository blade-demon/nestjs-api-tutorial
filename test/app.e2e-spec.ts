import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.clearDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/signup')
          .withBody({
            email: '',
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/signup')
          .withBody({
            email: 'test@example.com',
            password: '',
          })
          .expectStatus(400);
      });
      it('should throw if body empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/signup')
          .expectStatus(400);
      });
      it('should signup', () => {
        const dto: AuthDto = {
          email: 'test@example.com',
          password: '123',
        };

        pactum
          .spec()
          .post('http://localhost:3333/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
    });
    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/signin')
          .withBody({
            email: '',
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/signin')
          .withBody({
            email: 'test@example.com',
            password: '',
          })
          .expectStatus(400);
      });
      it('should throw if body empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/signin')
          .expectStatus(400);
      });
      it('should signin', () => {
        const dto: AuthDto = {
          email: 'test@example.com',
          password: '123',
        };

        pactum
          .spec()
          .post('http://localhost:3333/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('token', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('http://localhost:3333/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
            Accept: 'application/json',
          })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Vladimir',
          email: 'vlad@codewithvlad.com',
        };
        return pactum
          .spec()
          .patch('http://localhost:3333/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Create bookmark', () => {});

    describe('Get bookmarks', () => {});
    describe('Get bookmark by id', () => {});
    describe('Edit bookmark by id', () => {});
    describe('Eelete bookmark by id', () => {});
  });
});
