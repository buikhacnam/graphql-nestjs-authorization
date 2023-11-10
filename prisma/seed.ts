import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Role
  await prisma.$executeRaw`insert into Role (id, name, created_at, updated_at)
  values (1, 'ADMIN', NOW(), NOW()),
  (2, 'USER', NOW(), NOW());`;

  // Permission
  await prisma.$executeRaw`insert into Permission (id, name, created_at, updated_at)
  values (1, 'GENERAL_ADMIN_PERMISSION', NOW(), NOW()),
  (2, 'GENERAL_USER_PERMISSION', NOW(), NOW()),
  (3, 'BLOCK_USER', NOW(), NOW());`;

  // _PermissionToRole
  await prisma.$executeRaw`insert into _PermissionToRole (B, A)
  values 
  (1,1),
  (1,2),
  (1,3),
  (2,2);`;

  // Admin
  await prisma.$executeRaw`insert into user (id, email, password, created_at, first_name, last_name, role_id, updated_at)
  values('e0ff5ba4-eb83-4d5c-8f0c-d5cdec039d78', 'admin@email.com','$argon2id$v=19$m=65536,t=3,p=4$CSxPaMZp86KcWVTkpUHBXQ$Gpxsszn8g+mjjOJO70eqfalLFqd72jcuB4B/o8qZ9Qw', now(), 'admin', 'me', 1, now());`;

  // User
  await prisma.$executeRaw`insert into user (id, email, password, created_at, first_name, last_name, role_id, updated_at)
  values('e0ff5ba4-eb83-4d5c-8f0c-d5cdec039d79', 'user1@email.com','$argon2id$v=19$m=65536,t=3,p=4$CSxPaMZp86KcWVTkpUHBXQ$Gpxsszn8g+mjjOJO70eqfalLFqd72jcuB4B/o8qZ9Qw', now(), 'user', '1', 2, now());`;
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
