import { SetMetadata } from '@nestjs/common';

export enum Permission {
  GENERAL_ADMIN_PERMISSION = 'GENERAL_ADMIN_PERMISSION',
  GENERAL_USER_PERMISSION = 'GENERAL_USER_PERMISSION',
  BLOCK_USER = 'BLOCK_USER',
}

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
