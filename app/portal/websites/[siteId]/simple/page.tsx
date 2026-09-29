import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { resolvePortalSite } from '@/lib/portal-client';
import SimpleEditorForm from './SimpleEditorForm';

export default async function SimpleWebsiteEditorPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const userId = parseInt(session.user.id, 10);
  const resolved = await resolvePortalSite(userId, parseInt(siteId));
  if (!resolved) notFound();
  const { site } = resolved;

  if (!site.isSimple) redirect(`/portal/websites/${site.id}`);

  // Find the home page post
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.websiteId, site.id), eq(posts.slug, 'home')))
    .limit(1);

  if (!post) {
    return <div className="p-8 text-center text-red-500">Home page not found. Please contact support.</div>;
  }

  // Parse blocks
  let blocks = [];
  try {
    blocks = JSON.parse(post.content || '[]');
  } catch(e) {}

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit {site.name}</h1>
        <p className="text-muted-foreground text-sm">Update your website content below. Changes save instantly.</p>
      </div>
      <SimpleEditorForm siteId={site.id} postId={post.id} initialBlocks={blocks} />
    </div>
  );
}
