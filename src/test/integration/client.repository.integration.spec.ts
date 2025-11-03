import {
  ClientRepository,
  ClientAccountRepository,
} from '../../auth-clients/repositories/client.repository';
import { PlanType, Provider } from '../../auth-clients/dto/client.dto';
import { PrismaService } from '../../db/prisma.service';

// Global data
const password = 'password123';
const newPassword = 'newPassword123';

// Data for client tests
const createClientDto = (overrrides = {}) => ({
  email: `test-${Date.now()}-${Math.random().toString(36)}@example.com`,
  name: 'Test User',
  password,
  plan: PlanType.FREE,
  ...overrrides,
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
    await prismaService.clientAccount.deleteMany({});
    await prismaService.clients.deleteMany({});
  });

  describe('createClient', () => {
    it('should create a new client', async () => {
      const client = await clientRepository.createClient(clientDto);

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
      const createdClient = await clientRepository.createClient(clientDto);

      expect(createdClient).toBeDefined();

      const retrievedClient = await clientRepository.getClientByEmail(
        clientDto.email,
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
  });

  describe('getClientById', () => {
    it('should return a client by id', async () => {
      const createdClient = await clientRepository.createClient(clientDto);

      expect(createdClient).toBeDefined();

      const retrievedClient = await clientRepository.getClientById({
        id: createdClient.id,
      });

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
  });

  describe('updatePasswordClient', () => {
    it('should update the password of a client', async () => {
      const createdClient = await clientRepository.createClient(clientDto);

      expect(createdClient).toBeDefined();

      const updatedClient = await clientRepository.updatePasswordClient(
        createdClient.id,
        newPassword,
      );

      expect(updatedClient).toBeDefined();
      expect(updatedClient.password).not.toBe(createdClient.password);
      expect(updatedClient.password).toBe(newPassword);
    });
  });

  describe('createClientAccount', () => {
    it('should create a new client account', async () => {
      await prismaService.$transaction(async (tx) => {
        const createdClient = await clientRepository.createClient(
          clientDto,
          tx,
        );

        expect(createdClient).toBeDefined();

        const providerAccountDto = {
          provider: Provider.GOOGLE,
          providerAccountId: `google-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}`,
        };

        const clientAccount = await clientAccountRepository.createClientAccount(
          createdClient.id,
          providerAccountDto,
          tx,
        );

        expect(clientAccount).toBeDefined();
        expect(clientAccount.clientId).toBe(createdClient.id);
        expect(clientAccount.provider).toBe(providerAccountDto.provider);
        expect(clientAccount.providerAccountId).toBe(
          providerAccountDto.providerAccountId,
        );

        expect(clientAccount).toMatchObject({
          id: clientAccount.id,
          provider: providerAccountDto.provider,
          providerAccountId: providerAccountDto.providerAccountId,
          clientId: createdClient.id,
          updatedAt: clientAccount.updatedAt,
          createdAt: clientAccount.createdAt,
        });
      });
    });
  });
});
