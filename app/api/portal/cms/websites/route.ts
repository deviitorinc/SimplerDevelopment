import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { clientWebsites, posts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getPortalClient } from '@/lib/portal-client';
import { authorizePortal, isAuthError } from '@/lib/portal-auth';
import { generateUniqueSubdomain, validateSubdomain, isSubdomainAvailable } from '@/lib/subdomain';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  // Service access check
  const authResult = await authorizePortal({ action: 'read', requireService: 'websites' });
  if (isAuthError(authResult)) return authResult.response;

  const userId = parseInt(session.user.id, 10);
  const client = await getPortalClient(userId);
  if (!client) return NextResponse.json({ success: false, message: 'Client not found' }, { status: 404 });

  const data = await db
    .select()
    .from(clientWebsites)
    .where(eq(clientWebsites.clientId, client.id))
    .orderBy(clientWebsites.createdAt);

  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  // Service access check
  const authResult2 = await authorizePortal({ action: 'write', requireService: 'websites' });
  if (isAuthError(authResult2)) return authResult2.response;

  const userId = parseInt(session.user.id, 10);
  const client = await getPortalClient(userId);
  if (!client) return NextResponse.json({ success: false, message: 'Client not found' }, { status: 404 });

  const body = await req.json();
  const { name, domain, description, subdomain: requestedSubdomain, isSimple } = body;

  if (!name) return NextResponse.json({ success: false, message: 'Website name is required' }, { status: 400 });

  // Generate or validate subdomain
  let subdomain: string;
  if (requestedSubdomain) {
    const error = validateSubdomain(requestedSubdomain);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });
    if (!(await isSubdomainAvailable(requestedSubdomain))) {
      return NextResponse.json({ success: false, message: 'That subdomain is already taken.' }, { status: 409 });
    }
    subdomain = requestedSubdomain;
  } else {
    const companyName = client.company || 'site';
    subdomain = await generateUniqueSubdomain(companyName, name);
  }

  const platformDomain = process.env.NEXT_PUBLIC_TENANT_DOMAIN || (process.env.NEXT_PUBLIC_APP_URL || 'https://simplerdevelopment.com').replace(/^https?:\/\//, '');
  
  const [site] = await db.insert(clientWebsites).values({
    clientId: client.id,
    name,
    domain: domain || null,
    description: description || null,
    subdomain,
    vercelDomain: `${subdomain}.${platformDomain}`,
    deploymentStatus: 'pending',
    active: true,
    isSimple: isSimple === true,
  }).returning();

  if (isSimple) {
    const blocks = [
      {
        id: crypto.randomUUID(),
        type: 'hero',
        values: {
          title: 'Welcome to ' + name,
          subtitle: 'We are glad you are here.',
          description: '',
          primaryButtonText: 'Shop Now',
          primaryButtonUrl: '#shop'
        }
      },
      {
        id: crypto.randomUUID(),
        type: 'text',
        values: {
          content: '<h2>About Us</h2><p>Tell your story here...</p>'
        }
      },
      {
        id: crypto.randomUUID(),
        type: 'featured-products',
        values: {
          title: 'Featured Products',
          description: 'Check out our latest collection',
          collectionId: ''
        }
      },
      {
        id: crypto.randomUUID(),
        type: 'site-footer',
        values: {
          copyright: new Date().getFullYear().toString(),
          showSocial: true
        }
      }
    ];

    await db.insert(posts).values({
      websiteId: site.id,
      title: 'Home',
      slug: 'home',
      postType: 'page',
      content: JSON.stringify(blocks),
      published: true,
      publishedAt: new Date()
    });
  }


  return NextResponse.json({ success: true, data: site });
}
