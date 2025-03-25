import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { LocalStrategy } from './local-auth/local.strategy';
import { JwtStrategy } from './jwt-auth/jwt.strategy';
import { Jwt2faStrategy } from './jwt-auth/jwt-2fa.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    UsersService,
    LocalStrategy,
    JwtStrategy,
    Jwt2faStrategy,
  ],
  exports: [JwtModule, AuthenticationService],
})
export class AuthenticationModule {}
