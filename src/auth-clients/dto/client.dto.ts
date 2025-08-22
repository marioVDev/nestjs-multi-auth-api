/**
 * Data Transfer Object for registering a new client
 */
export interface RegisterClientDto {
  id?: string;
  email: string;
  password: string;
  name: string;
}
