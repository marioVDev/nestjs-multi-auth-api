import { nanoid } from 'nanoid';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IdFactory {
  public generateId(length: number = 21): string {
    return nanoid(length);
  }
}
