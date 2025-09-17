import { Injectable } from '@nestjs/common';

@Injectable()
export class IdFactory {
  public async generateId(length: number = 21): Promise<string> {
    const { nanoid } = await import('nanoid');
    return nanoid(length);
  }
}
