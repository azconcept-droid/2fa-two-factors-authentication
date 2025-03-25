import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
      email: 'john@email.com',
      twoFactorAuthenticationSecret: null,
      isTwoFactorAuthenticationEnabled: false,
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
      email: 'maria@email.com',
      twoFactorAuthenticationSecret: null,
      isTwoFactorAuthenticationEnabled: false,
    },
  ];

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    this.users.find(
      (user) => user.userId === userId,
    ).isTwoFactorAuthenticationEnabled = true;
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    this.users.find(
      (user) => user.userId === userId,
    ).twoFactorAuthenticationSecret = secret;
  }
}
