export interface User {
  userId: number;
  username: string;
  password: string;
  email: string;
  twoFactorAuthenticationSecret: string;
  isTwoFactorAuthenticationEnabled: boolean;
}
