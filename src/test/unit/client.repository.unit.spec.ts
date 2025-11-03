/* eslint-disable @typescript-eslint/unbound-method */

import {
  ClientRepository,
  ClientAccountRepository,
} from '../../auth-clients/repositories/client.repository';
import { randomUUID } from 'crypto';
import { PlanType, Provider } from '../../auth-clients/dto/client.dto';
import { PrismaService } from '../../db/prisma.service';

// Global data
const email = 'test@example.com';
const password = 'password123';
const newPassword = 'newPassword123';

// Data for client tests
const createClientDto = {
  email,
  name: 'Test User',
  password,
  plan: PlanType.FREE,
};

const createMockClient = (overrides = {}) => ({
  id: randomUUID(),
  email,
  name: 'Test User',
  password,
  plan: PlanType.FREE,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Data for client account tests
const createMockClientAccount = (overrides = {}) => ({
  id: randomUUID(),
  clientId: randomUUID(),
  provider: Provider.GOOGLE,
  providerAccountId: 'google-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ClientRepository', () => {
  let clientRepository: ClientRepository;
  let mockPrisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    mockPrisma = {
      clients: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    clientRepository = new ClientRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe('createClient', () => {
    it('should create a new client', async () => {
      const expectedResult = createMockClient();
      (mockPrisma.clients.create as jest.Mock).mockResolvedValue(
        expectedResult,
      );
      const result = await clientRepository.createClient(createClientDto);

      expect(mockPrisma.clients.create).toHaveBeenCalledWith({
        data: {
          email: createClientDto.email,
          name: createClientDto.name,
          password: createClientDto.password,
          plan: createClientDto.plan,
        },
      });

      expect(result).toEqual({ ...expectedResult });
      expect(mockPrisma.clients.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('getClientByEmail', () => {
    it('should return a client by email', async () => {
      const expectedResult = createMockClient();
      (mockPrisma.clients.findUnique as jest.Mock).mockResolvedValue(
        expectedResult,
      );
      const result = await clientRepository.getClientByEmail(
        expectedResult.email,
      );

      expect(result).toEqual({ ...expectedResult });
      expect(mockPrisma.clients.findUnique).toHaveBeenCalledWith({
        where: { email: expectedResult.email },
      });
      expect(mockPrisma.clients.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null if client not found by email', async () => {
      (mockPrisma.clients.findUnique as jest.Mock).mockResolvedValue(null);
      const email = 'nonexistent@example.com';
      const result = await clientRepository.getClientByEmail(email);
      expect(result).toBeNull();
      expect(mockPrisma.clients.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('getClientById', () => {
    it('should return a client by id', async () => {
      const expectedResult = createMockClient();
      (mockPrisma.clients.findUnique as jest.Mock).mockResolvedValue(
        expectedResult,
      );
      const id = expectedResult.id;

      const result = await clientRepository.getClientById({ id });

      expect(result).toEqual({ ...expectedResult });
      expect(mockPrisma.clients.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(mockPrisma.clients.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null if client not found by id', async () => {
      (mockPrisma.clients.findUnique as jest.Mock).mockResolvedValue(null);
      const id = randomUUID();
      const result = await clientRepository.getClientById({ id });
      expect(result).toBeNull();
      expect(mockPrisma.clients.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('updatePasswordClient', () => {
    it('should update the password of a client', async () => {
      const expectedResult = createMockClient({
        password: newPassword,
      });
      (mockPrisma.clients.update as jest.Mock).mockResolvedValue(
        expectedResult,
      );
      const id = expectedResult.id;

      const result = await clientRepository.updatePasswordClient(
        id,
        expectedResult.password,
      );

      expect(result).toEqual({ ...expectedResult });
      expect(mockPrisma.clients.update).toHaveBeenCalledWith({
        where: { id },
        data: { password: newPassword },
      });
      expect(mockPrisma.clients.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('database errors', () => {
    it('should throw an error if database operation fails', async () => {
      const dbError = new Error('Database error');
      (mockPrisma.clients.create as jest.Mock).mockRejectedValue(dbError);

      await expect(
        clientRepository.createClient(createClientDto),
      ).rejects.toThrow(dbError);
    });
  });
});

describe('ClientAccountRepository', () => {
  let clientAccountRepository: ClientAccountRepository;
  let mockPrisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    mockPrisma = {
      clientAccount: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    clientAccountRepository = new ClientAccountRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe('createClientAccount', () => {
    it('should create a new client account', async () => {
      const expectedResult = createMockClientAccount();
      (mockPrisma.clientAccount.create as jest.Mock).mockResolvedValue(
        expectedResult,
      );
      const clientId = expectedResult.clientId;
      const data = {
        provider: expectedResult.provider,
        providerAccountId: expectedResult.providerAccountId,
      };

      const result = await clientAccountRepository.createClientAccount(
        clientId,
        data,
      );

      expect(result).toEqual({ ...expectedResult });
      expect(mockPrisma.clientAccount.create).toHaveBeenCalledWith({
        data: { clientId, ...data },
      });
      expect(mockPrisma.clientAccount.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('getClientAccountByProviderAndProviderId', () => {
    it('should return a client account by provider and providerAccountId', async () => {
      const expectedResult = createMockClientAccount();
      (mockPrisma.clientAccount.findUnique as jest.Mock).mockResolvedValue(
        expectedResult,
      );
      const data = {
        provider: expectedResult.provider,
        providerAccountId: expectedResult.providerAccountId,
      };

      const result =
        await clientAccountRepository.getClientAccountByProviderAndProviderId(
          data,
        );

      expect(result).toEqual({ ...expectedResult });
      expect(mockPrisma.clientAccount.findUnique).toHaveBeenCalledWith({
        where: {
          provider_providerAccountId: {
            provider: data.provider,
            providerAccountId: data.providerAccountId,
          },
        },
      });
      expect(mockPrisma.clientAccount.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
