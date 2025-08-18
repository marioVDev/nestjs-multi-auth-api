export interface RegisterClientDto {
  email: string;
  password: string;
  userName: string;
  appName: string;
  clientId?: string;
  JWT_secret?: string;
}
