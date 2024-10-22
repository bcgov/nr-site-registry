import { Injectable, Scope } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class TransactionManagerService {
  private manager: EntityManager | null = null;

  setEntityManager(manager: EntityManager) {
    this.manager = manager;
  }

  getEntityManager(): EntityManager {
    if (!this.manager) {
      throw new Error('EntityManager has not been set.');
    }
    return this.manager;
  }
}
