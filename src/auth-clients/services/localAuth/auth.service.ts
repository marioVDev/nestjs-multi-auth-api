import { Provider } from 'src/auth-clients/dto/client.dto';
import { AuthService } from 'src/auth-clients/auth.service';
import { CreateClientDto } from 'src/auth-clients/dto/client.dto';
import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';

@Injectable()
export class AuthLocalService {
  private provider = Provider.LOCAL;

  constructor(private readonly authService: AuthService) {}

  public async registerLocalAuth(clientData: CreateClientDto) {
    try {
      const registrationData = {
        ...clientData,
        provider: this.provider,
        providerAccountId: null,
      };

      const serverResponse =
        await this.authService.registerWithOAuthAndLocal(registrationData);

      return serverResponse;
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err;
      } else {
        throw new InternalServerErrorException(
          'Registration service temporarily unavailable',
        );
      }
    }
  }
}
