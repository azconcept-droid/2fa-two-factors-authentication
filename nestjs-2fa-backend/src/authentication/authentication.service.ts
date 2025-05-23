import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthenticationService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Partial<User>> {
    const user = await this.usersService.findOne(email);
    try {
      // Of course, we should consider encrypting the password
      const isMatch = pass === user.password;
      if (user && isMatch) {
        const { password: _, ...userWithoutPassword } = user;

        return userWithoutPassword;
      }
    } catch (e) {
      return null;
    }
  }

  async login(userWithoutPsw: Partial<User>) {
    const payload = {
      email: userWithoutPsw.email,
    };

    return {
      email: payload.email,
      access_token: this.jwtService.sign(payload),
    };
  }

  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(
      user.email,
      'nestjs-2fa-app',
      secret,
    );

    await this.usersService.setTwoFactorAuthenticationSecret(
      secret,
      user.userId,
    );

    return {
      secret,
      otpAuthUrl,
    };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    secret: string,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: secret,
    });
  }

  // isTwoFactorAuthenticationCodeValid(
  //   twoFactorAuthenticationCode: string,
  //   user: User,
  // ) {
  //   return authenticator.verify({
  //     token: twoFactorAuthenticationCode,
  //     secret: user.twoFactorAuthenticationSecret,
  //   });
  // }

  async loginWith2fa(userWithoutPsw: Partial<User>) {
    const payload = {
      email: userWithoutPsw.email,
      isTwoFactorAuthenticationEnabled:
        !!userWithoutPsw.isTwoFactorAuthenticationEnabled,
      isTwoFactorAuthenticated: true,
    };

    return {
      email: payload.email,
      access_token: this.jwtService.sign(payload),
    };
  }
  //   async login(userWithoutPsw: Partial<User>, isTwoFactorAuthenticated = false) {
  //   const payload = {
  //     email: userWithoutPsw.email,
  //     isTwoFactorAuthenticationEnabled: !!userWithoutPsw.isTwoFactorAuthenticationEnabled,
  //     isTwoFactorAuthenticated,
  //   };

  //   return {
  //     email: payload.email,
  //   };
  // }
}
