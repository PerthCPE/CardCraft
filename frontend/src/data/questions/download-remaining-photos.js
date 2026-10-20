const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../../../public/images/toeic');

const remainingItems = [
  { qId: 'q-list-p1-04', query: 'airport queue', filename: 'part1-p04-airport-queue.jpg' },
  { qId: 'q-list-p1-08', query: 'construction blueprint', filename: 'part1-p08-engineers-blueprint.jpg' },
  { qId: 'q-list-p1-11', query: 'container port', filename: 'part1-p11-harbor-containers.jpg' },
  { qId: 'q-list-p1-16', query: 'office corridor', filename: 'part1-p16-office-corridor.jpg' },

  { qId: 'q-list-p1-ext-02', query: 'whiteboard chart', filename: 'part1-ext02-board-chart.jpg' },
  { qId: 'q-list-p1-ext-03', query: 'business suit meeting', filename: 'part1-ext03-business-attire.jpg' },
  { qId: 'q-list-p1-ext-04', query: 'presentation screen', filename: 'part1-ext04-timeline-pointing.jpg' },
  { qId: 'q-list-p1-ext-05', query: 'meeting standing', filename: 'part1-ext05-meeting-standing.jpg' },

  { qId: 'q-list-p1-ext-07', query: 'warehouse racks', filename: 'part1-ext07-warehouse-racks.jpg' },
  { qId: 'q-list-p1-ext-08', query: 'safety vest', filename: 'part1-ext08-safety-vest.jpg' },
  { qId: 'q-list-p1-ext-09', query: 'pallet jack', filename: 'part1-ext09-pallet-transport.jpg' },
  { qId: 'q-list-p1-ext-10', query: 'warehouse aisle', filename: 'part1-ext10-tall-shelving.jpg' },

  { qId: 'q-list-p1-ext-13', query: 'steel construction', filename: 'part1-ext13-steel-structure.jpg' },
  { qId: 'q-list-p1-ext-14', query: 'blueprint table', filename: 'part1-ext14-document-gesture.jpg' },
  { qId: 'q-list-p1-ext-15', query: 'surveyor tripod', filename: 'part1-ext15-reflective-vests.jpg' },

  { qId: 'q-list-p1-ext-17', query: 'bookshelf library', filename: 'part1-ext17-volumes-vertical.jpg' },
  { qId: 'q-list-p1-ext-18', query: 'library interior', filename: 'part1-ext18-illuminated-aisle.jpg' },
  { qId: 'q-list-p1-ext-19', query: 'reading bookstore', filename: 'part1-ext19-browsing-titles.jpg' },
  { qId: 'q-list-p1-ext-20', query: 'books row', filename: 'part1-ext20-neat-rows-books.jpg' },

  { qId: 'q-list-p1-ext-23', query: 'airport terminal', filename: 'part1-ext23-polished-floor.jpg' },
  { qId: 'q-list-p1-ext-24', query: 'airport gate', filename: 'part1-ext24-terminal-corridor.jpg' },
  { qId: 'q-list-p1-ext-25', query: 'airport luggage', filename: 'part1-ext25-travelers-luggage.jpg' },

  { qId: 'q-list-p1-ext-27', query: 'supermarket produce', filename: 'part1-ext27-open-bins.jpg' },
  { qId: 'q-list-p1-ext-30', query: 'vegetables market', filename: 'part1-ext30-fruits-vegetables.jpg' },

  { qId: 'q-list-p1-ext-33', query: 'cafe terrace', filename: 'part1-ext33-conversing-tables.jpg' },
  { qId: 'q-list-p1-ext-35', query: 'patio umbrellas', filename: 'part1-ext35-large-umbrellas.jpg' },

  { qId: 'q-list-p1-ext-37', query: 'projector slide', filename: 'part1-ext37-visual-slide.jpg' },
  { qId: 'q-list-p1-ext-38', query: 'audience seminar', filename: 'part1-ext38-audience-seated.jpg' },
  { qId: 'q-list-p1-ext-39', query: 'boardroom table', filename: 'part1-ext39-laptops-table.jpg' },
  { qId: 'q-list-p1-ext-40', query: 'keynote speaker', filename: 'part1-ext40-standing-speaker.jpg' },

  { qId: 'q-list-p1-ext-42', query: 'chemistry glassware', filename: 'part1-ext42-glassware-workbench.jpg' },
  { qId: 'q-list-p1-ext-44', query: 'laboratory equipment', filename: 'part1-ext44-scientific-instruments.jpg' },
  { qId: 'q-list-p1-ext-45', query: 'microscope research', filename: 'part1-ext45-optical-instrument.jpg' },

  { qId: 'q-list-p1-ext-46', query: 'factory machinery', filename: 'part1-ext46-industrial-inspection.jpg' },
  { qId: 'q-list-p1-ext-47', query: 'assembly line', filename: 'part1-ext47-machinery-line.jpg' },
  { qId: 'q-list-p1-ext-50', query: 'cleanroom factory', filename: 'part1-ext50-clean-production.jpg' }
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'CardCraftEducational/1.0 (contact@cardcraft.app)' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    function getWithRedirect(u) {
      https.get(u, { headers: { 'User-Agent': 'CardCraftEducational/1.0 (contact@cardcraft.app)' } }, res => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          getWithRedirect(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Status ${res.statusCode} for ${u}`));
          return;
        }
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close(() => resolve());
        });
      }).on('error', reject);
    }
    getWithRedirect(url);
  });
}

async function searchAndDownload(item) {
  const encQuery = encodeURIComponent(item.query);
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encQuery}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime|size&format=json`;

  try {
    const data = await fetchJson(searchUrl);
    if (!data.query || !data.query.pages) {
      console.warn(`No search results for ${item.query}`);
      return false;
    }

    const pages = Object.values(data.query.pages);
    const jpegs = pages
      .map(p => p.imageinfo && p.imageinfo[0])
      .filter(info => info && info.mime === 'image/jpeg' && info.url);

    if (jpegs.length === 0) {
      console.warn(`No JPEGs found for ${item.query}`);
      return false;
    }

    const chosen = jpegs[0];
    const dest = path.join(targetDir, item.filename);
    console.log(`Downloading ${item.filename}...`);
    await downloadFile(chosen.url, dest);
    console.log(`Saved ${item.filename} (${fs.statSync(dest).size} bytes)`);
    return true;
  } catch (err) {
    console.error(`Error downloading ${item.filename}:`, err.message);
    return false;
  }
}

async function main() {
  console.log(`Downloading remaining ${remainingItems.length} photos...`);
  let okCount = 0;
  for (let i = 0; i < remainingItems.length; i++) {
    const item = remainingItems[i];
    console.log(`[${i + 1}/${remainingItems.length}] ${item.filename}...`);
    const success = await searchAndDownload(item);
    if (success) okCount++;
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`All done: ${okCount}/${remainingItems.length} downloaded.`);
}

main();
