const fs = require('fs');
const file = 'app/api/portal/cms/websites/route.ts';
let code = fs.readFileSync(file, 'utf8');

// Add posts schema to import
code = code.replace(
  "import { clientWebsites } from '@/lib/db/schema';",
  "import { clientWebsites, posts } from '@/lib/db/schema';"
);

// Add block type generation
const blockGenerationCode = `
  const [site] = await db.insert(clientWebsites).values({
    clientId: client.id,
    name,
    domain: domain || null,
    description: description || null,
    subdomain,
    vercelDomain: \`\${subdomain}.\${platformDomain}\`,
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
`;

code = code.replace(
  "const { name, domain, description, subdomain: requestedSubdomain } = body;",
  "const { name, domain, description, subdomain: requestedSubdomain, isSimple } = body;"
);

code = code.replace(/const \[site\] = await db\.insert\(clientWebsites\)[\s\S]*?\}\)\.returning\(\);/, blockGenerationCode);

fs.writeFileSync(file, code);
