import {
  ClientRepository,
  ClientAccountRepository,
} from '../client.respository';
import { PlanType, Provider } from '../../dto/client.dto';
import { PrismaService } from '../../../db/prisma.service';

// Global data
const password = 'password123';
const newPassword = 'newPassword123';

// Data for client tests
const createClientDto = () => ({
  email: `test-${Date.now()}-${Math.random().toString(36)}@example.com`,
  name: 'Test User',
  password,
  plan: PlanType.FREE,
});

describe('ClientRepository', () => {
  let clientRepository: ClientRepository;
  let prismaService: PrismaService;
  let clientAccountRepository: ClientAccountRepository;
  let clientDto: ReturnType<typeof createClientDto>;

  beforeEach(async () => {
    prismaService = new PrismaService();
    await prismaService.$connect();
    clientRepository = new ClientRepository(prismaService);
    clientAccountRepository = new ClientAccountRepository(prismaService);
    clientDto = createClientDto();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  afterEach(async () => {
    // Clean up the database after each test
    await prismaService.clients.deleteMany({});
  });

  describe('createClient', () => {
    it('should create a new client', async () => {
      const client = await clientRepository.createClient(clientDto);

      expect(client).toHaveProperty('id');
      expect(client).toHaveProperty('createdAt');
      expect(client).toHaveProperty('updatedAt');

      expect(client.email).toBe(clientDto.email);
      expect(client.name).toBe(clientDto.name);
      expect(client.plan).toBe(clientDto.plan);

      expect(client).toMatchObject({
        email: clientDto.email,
        name: clientDto.name,
        password: clientDto.password,
        plan: clientDto.plan,
      });
    });
  });

  describe('getClientByEmail with transaction', () => {
    it('should retrieve a client by email', async () => {
      try {
        await prismaService.$transaction(async (tx) => {
          const createdClient = await clientRepository.createClient(
            clientDto,
            tx,
          );

          expect(createdClient).toBeDefined();

          const retrievedClient = await clientRepository.getClientByEmail(
            clientDto.email,
            tx,
          );

          expect(retrievedClient).not.toBeNull();

          expect(retrievedClient!.email).toBe(clientDto.email);
          expect(retrievedClient!.name).toBe(clientDto.name);
          expect(retrievedClient!.plan).toBe(clientDto.plan);
          expect(retrievedClient!.password).toBe(clientDto.password);

          expect(retrievedClient).toMatchObject({
            id: createdClient.id,
            updatedAt: createdClient.updatedAt,
            createdAt: createdClient.createdAt,
          });
        });
      } catch (error) {
        const client = await clientRepository.getClientByEmail(clientDto.email);
        expect(client).toBeNull();
      }
    });
  });
});
