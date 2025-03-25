import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  Request,
  UnauthorizedException,
  Req,
  Body,
  Response,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LocalAuthGuard } from './local-auth/local-auth.guard';
import { User } from 'src/users/user.entity';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { Jwt2faAuthGuard } from './jwt-auth/jwt-2fa-auth.guard';
import { response } from 'express';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req) {
    const userWithoutPsw: Partial<User> = req.user;

    return this.authenticationService.login(userWithoutPsw);
  }


  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  async register(@Response() response, @Request() request) {
    const { otpAuthUrl, secret } =
      await this.authenticationService.generateTwoFactorAuthenticationSecret(
        request.user,
      );

    const qrcode = await this.authenticationService.generateQrCodeDataURL(otpAuthUrl);
    return response.json({
      secret,
      qrcode
    });
  }

  @Post('2fa/turn-on')
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(@Response() response, @Req() request, @Body() body) {
    const isCodeValid =
      this.authenticationService.isTwoFactorAuthenticationCodeValid(
        body.twoFactorAuthenticationCode,
        body.secret,
      );
    if (isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    await this.usersService.turnOnTwoFactorAuthentication(request.user.id);
    
    return response.json({
      isValid: isCodeValid,
    });
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(Jwt2faAuthGuard)
  async authenticate(@Request() request, @Body() body) {
    const isCodeValid =
      this.authenticationService.isTwoFactorAuthenticationCodeValid(
        body.twoFactorAuthenticationCode,
        request.user,
      );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return this.authenticationService.loginWith2fa(request.user);
  }
}
