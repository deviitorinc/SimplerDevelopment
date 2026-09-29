const fs = require('fs');
const file = 'app/portal/websites/[siteId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "import { pCard } from '@/components/portal/portal-ui';",
  "import { pCard, pBtnPrimary, pBtnGhost } from '@/components/portal/portal-ui';"
);

fs.writeFileSync(file, code);
