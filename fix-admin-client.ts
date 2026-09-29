import { db } from './lib/db';
import { users, clients } from './lib/db/schema';
import { eq } from 'drizzle-orm';

async function fix() {
  const [admin] = await db.select().from(users).where(eq(users.email, 'admin@example.com')).limit(1);
  if (!admin) {
    console.log('Admin not found');
    process.exit(1);
  }
  
  const existing = await db.select().from(clients).where(eq(clients.userId, admin.id)).limit(1);
  if (existing.length > 0) {
    console.log('Client already exists');
    process.exit(0);
  }
  
  await db.insert(clients).values({
    userId: admin.id,
    company: 'SimplerDevelopment Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('Created client for admin');
  process.exit(0);
}

fix().catch(console.error);
