const fs = require('fs');
const file = 'app/portal/websites/[siteId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const simpleDashboard = `
  if (site.isSimple) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-extrabold tracking-[-0.02em] text-foreground flex items-center gap-2">
              {site.name}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Simple Builder</span>
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
              <a
                href={\`https://\${effectiveDomain}\`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-mono text-xs"
              >
                {effectiveDomain}
                <span className="material-icons text-[14px]">open_in_new</span>
              </a>
              <span className="text-muted-foreground">&middot;</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <span className={\`w-2 h-2 rounded-full \${site.active ? 'bg-green-500' : 'bg-red-500'}\`} />
                {site.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={\`/portal/websites/\${site.id}/simple\`} className={pBtnPrimary}>
              <span className="material-icons text-base">edit</span>
              Edit Website
            </Link>
            <Link href={\`/portal/websites/\${site.id}/settings\`} className={pBtnGhost}>
              <span className="material-icons text-base">settings</span>
              Settings
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <span className="material-icons text-3xl">auto_awesome</span>
          </div>
          <h2 className="text-xl font-bold">Your website is ready</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Click the Edit Website button above to customize your text and images. 
            All layout and design is handled automatically.
          </p>
          <div className="pt-4">
            <Link href={\`/portal/websites/\${site.id}/simple\`} className={pBtnPrimary}>
              Edit Content
            </Link>
          </div>
        </div>
      </div>
    );
  }
`;

// Inject simpleDashboard right before the normal dashboard return
code = code.replace(/  return \(\s*<div className="max-w-4xl mx-auto space-y-6">/, simpleDashboard + '\n\n  return (\n    <div className="max-w-4xl mx-auto space-y-6">');

fs.writeFileSync(file, code);
