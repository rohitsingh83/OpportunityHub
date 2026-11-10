const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function getIds() {
  const opps = await fetch('http://localhost:5000/api/opportunities').then((r) => r.json());
  const apps = await fetch('http://localhost:5000/api/applications').then((r) => r.json());
  const oppId = opps.data[0]._id;
  const appId = apps.data[0]._id;
  return { oppId, appId };
}

async function capture() {
  const { oppId, appId } = await getIds();

  const pages = [
    {
      file: '01-home-search-filter.png',
      url: 'http://localhost:5173/',
    },
    {
      file: '02-opportunity-details.png',
      url: `http://localhost:5173/opportunity/${oppId}`,
    },
    {
      file: '03-apply-form.png',
      url: `http://localhost:5173/opportunity/${oppId}/apply`,
    },
    {
      file: '04-confirmation.png',
      url: `http://localhost:5173/confirmation/${appId}`,
    },
    {
      file: '05-admin-opportunities.png',
      url: 'http://localhost:5173/admin',
    },
    {
      file: '06-admin-add-edit.png',
      url: 'http://localhost:5173/admin/new',
    },
    {
      file: '07-admin-applications.png',
      url: 'http://localhost:5173/admin/applications',
    },
  ];

  for (const page of pages) {
    const outPath = path.join(SCREENSHOTS_DIR, page.file);
    console.log(`Capturing ${page.file} from ${page.url}...`);

    // Run headless edge with screenshot flag
    const res = spawnSync(
      EDGE_PATH,
      [
        '--headless',
        '--disable-gpu',
        '--hide-scrollbars',
        '--window-size=1280,1080',
        `--screenshot=${outPath}`,
        page.url,
      ],
      { timeout: 15000 }
    );

    if (fs.existsSync(outPath)) {
      const stats = fs.statSync(outPath);
      console.log(`✅ Saved ${page.file} (${stats.size} bytes)`);
    } else {
      console.warn(`⚠️ Failed to generate ${page.file}`);
      if (res.stderr) console.error(res.stderr.toString());
    }
  }
  console.log('Finished capturing screenshots.');
}

capture().catch(console.error);

