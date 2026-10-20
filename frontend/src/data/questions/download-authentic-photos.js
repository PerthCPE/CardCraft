const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../../../public/images/toeic');

const itemsToDownload = [
  { qId: 'q-list-p1-02', query: 'warehouse pallet rack storage', filename: 'part1-p02-warehouse-pallets.jpg' },
  { qId: 'q-list-p1-03', query: 'outdoor cafe patio dining umbrellas', filename: 'part1-p03-cafe-dining.jpg' },
  { qId: 'q-list-p1-04', query: 'airport check in passengers queue luggage', filename: 'part1-p04-airport-queue.jpg' },
  { qId: 'q-list-p1-06', query: 'conference presentation projection screen speaker', filename: 'part1-p06-projector-presenter.jpg' },
  { qId: 'q-list-p1-07', query: 'woman typing office desk computer', filename: 'part1-p07-desk-typing.jpg' },
  { qId: 'q-list-p1-08', query: 'construction workers blueprint hard hat', filename: 'part1-p08-engineers-blueprint.jpg' },
  { qId: 'q-list-p1-10', query: 'library bookshelves books rows', filename: 'part1-p10-library-bookshelves.jpg' },
  { qId: 'q-list-p1-11', query: 'shipping containers port harbor freight', filename: 'part1-p11-harbor-containers.jpg' },
  { qId: 'q-list-p1-12', query: 'auditorium audience conference hall', filename: 'part1-p12-auditorium-audience.jpg' },
  { qId: 'q-list-p1-14', query: 'restaurant dining table setting glassware', filename: 'part1-p14-table-settings.jpg' },
  { qId: 'q-list-p1-15', query: 'parking lot parked cars office building', filename: 'part1-p15-parking-lot.jpg' },
  { qId: 'q-list-p1-16', query: 'modern office building corridor hallway', filename: 'part1-p16-office-corridor.jpg' },

  { qId: 'q-list-p1-ext-02', query: 'office whiteboard diagram chart graph', filename: 'part1-ext02-board-chart.jpg' },
  { qId: 'q-list-p1-ext-03', query: 'business people corporate attire suit office', filename: 'part1-ext03-business-attire.jpg' },
  { qId: 'q-list-p1-ext-04', query: 'business presentation pointing screen display', filename: 'part1-ext04-timeline-pointing.jpg' },
  { qId: 'q-list-p1-ext-05', query: 'business meeting standing discussion board', filename: 'part1-ext05-meeting-standing.jpg' },

  { qId: 'q-list-p1-ext-07', query: 'warehouse high storage shelving racks', filename: 'part1-ext07-warehouse-racks.jpg' },
  { qId: 'q-list-p1-ext-08', query: 'warehouse worker high visibility safety vest', filename: 'part1-ext08-safety-vest.jpg' },
  { qId: 'q-list-p1-ext-09', query: 'manual pallet jack transport boxes', filename: 'part1-ext09-pallet-transport.jpg' },
  { qId: 'q-list-p1-ext-10', query: 'warehouse storage aisle towering shelves', filename: 'part1-ext10-tall-shelving.jpg' },

  { qId: 'q-list-p1-ext-12', query: 'engineers safety helmets construction site', filename: 'part1-ext12-hard-hats.jpg' },
  { qId: 'q-list-p1-ext-13', query: 'steel framework skyscraper construction', filename: 'part1-ext13-steel-structure.jpg' },
  { qId: 'q-list-p1-ext-14', query: 'architect pointing blueprint plans desk', filename: 'part1-ext14-document-gesture.jpg' },
  { qId: 'q-list-p1-ext-15', query: 'surveyors reflective safety vests tripod', filename: 'part1-ext15-reflective-vests.jpg' },

  { qId: 'q-list-p1-ext-17', query: 'books organized vertically bookshelf spines', filename: 'part1-ext17-volumes-vertical.jpg' },
  { qId: 'q-list-p1-ext-18', query: 'brightly lit university library interior', filename: 'part1-ext18-illuminated-aisle.jpg' },
  { qId: 'q-list-p1-ext-19', query: 'person browsing books library bookstore', filename: 'part1-ext19-browsing-titles.jpg' },
  { qId: 'q-list-p1-ext-20', query: 'neat rows books wooden shelving', filename: 'part1-ext20-neat-rows-books.jpg' },

  { qId: 'q-list-p1-ext-22', query: 'airport departure board flight screens', filename: 'part1-ext22-overhead-screens.jpg' },
  { qId: 'q-list-p1-ext-23', query: 'airport terminal hall polished floor', filename: 'part1-ext23-polished-floor.jpg' },
  { qId: 'q-list-p1-ext-24', query: 'airport concourse travelers walking corridor', filename: 'part1-ext24-terminal-corridor.jpg' },
  { qId: 'q-list-p1-ext-25', query: 'passengers pulling rolling luggage airport', filename: 'part1-ext25-travelers-luggage.jpg' },

  { qId: 'q-list-p1-ext-27', query: 'supermarket produce display vegetable bins', filename: 'part1-ext27-open-bins.jpg' },
  { qId: 'q-list-p1-ext-28', query: 'shopper selecting produce grocery market', filename: 'part1-ext28-selecting-items.jpg' },
  { qId: 'q-list-p1-ext-29', query: 'supermarket aisle bright lighting shelves', filename: 'part1-ext29-overhead-lighting.jpg' },
  { qId: 'q-list-p1-ext-30', query: 'fruits vegetables market display crates organic', filename: 'part1-ext30-fruits-vegetables.jpg' },

  { qId: 'q-list-p1-ext-32', query: 'coffee cups cafe wooden table', filename: 'part1-ext32-beverage-cups.jpg' },
  { qId: 'q-list-p1-ext-33', query: 'people conversing cafe outdoor terrace', filename: 'part1-ext33-conversing-tables.jpg' },
  { qId: 'q-list-p1-ext-34', query: 'sidewalk outdoor cafe tables pedestrian street', filename: 'part1-ext34-pedestrian-walkway.jpg' },
  { qId: 'q-list-p1-ext-35', query: 'large umbrellas cafe terrace patio shade', filename: 'part1-ext35-large-umbrellas.jpg' },

  { qId: 'q-list-p1-ext-37', query: 'projector screen presentation slide conference', filename: 'part1-ext37-visual-slide.jpg' },
  { qId: 'q-list-p1-ext-38', query: 'audience seated presentation seminar hall', filename: 'part1-ext38-audience-seated.jpg' },
  { qId: 'q-list-p1-ext-39', query: 'boardroom table laptops meeting notebooks', filename: 'part1-ext39-laptops-table.jpg' },
  { qId: 'q-list-p1-ext-40', query: 'business speaker podium presentation conference', filename: 'part1-ext40-standing-speaker.jpg' },

  { qId: 'q-list-p1-ext-42', query: 'laboratory glassware beakers flasks workbench', filename: 'part1-ext42-glassware-workbench.jpg' },
  { qId: 'q-list-p1-ext-43', query: 'scientist white protective lab coat laboratory', filename: 'part1-ext43-white-labcoat.jpg' },
  { qId: 'q-list-p1-ext-44', query: 'scientific instruments laboratory equipment modern', filename: 'part1-ext44-scientific-instruments.jpg' },
  { qId: 'q-list-p1-ext-45', query: 'optical microscope adjustment scientific research', filename: 'part1-ext45-optical-instrument.jpg' },

  { qId: 'q-list-p1-ext-46', query: 'industrial technician inspecting automated machinery', filename: 'part1-ext46-industrial-inspection.jpg' },
  { qId: 'q-list-p1-ext-47', query: 'manufacturing assembly line machinery plant', filename: 'part1-ext47-machinery-line.jpg' },
  { qId: 'q-list-p1-ext-48', query: 'industrial control panel operator factory', filename: 'part1-ext48-operator-control.jpg' },
  { qId: 'q-list-p1-ext-49', query: 'factory worker personal protective equipment', filename: 'part1-ext49-protective-gear.jpg' },
  { qId: 'q-list-p1-ext-50', query: 'clean modern manufacturing plant floor', filename: 'part1-ext50-clean-production.jpg' }
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
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encQuery}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime|size&format=json`;

  try {
    const data = await fetchJson(searchUrl);
    if (!data.query || !data.query.pages) {
      console.warn(`No search results for ${item.query}`);
      return false;
    }

    const pages = Object.values(data.query.pages);
    // Filter for good JPEGs between 50KB and 5MB
    const jpegs = pages
      .map(p => p.imageinfo && p.imageinfo[0])
      .filter(info => info && info.mime === 'image/jpeg' && info.url);

    if (jpegs.length === 0) {
      console.warn(`No JPEGs found for ${item.query}`);
      return false;
    }

    // Pick best image
    const chosen = jpegs[0];
    const dest = path.join(targetDir, item.filename);
    console.log(`Downloading ${item.filename} from ${chosen.url.slice(0, 70)}...`);
    await downloadFile(chosen.url, dest);
    console.log(`Saved ${item.filename} (${fs.statSync(dest).size} bytes)`);
    return true;
  } catch (err) {
    console.error(`Error downloading ${item.filename}:`, err.message);
    return false;
  }
}

async function main() {
  console.log(`Starting download of ${itemsToDownload.length} authentic stock photographs...`);
  let successCount = 0;

  for (let i = 0; i < itemsToDownload.length; i++) {
    const item = itemsToDownload[i];
    console.log(`[${i + 1}/${itemsToDownload.length}] Processing ${item.filename}...`);
    const ok = await searchAndDownload(item);
    if (ok) {
      successCount++;
    }
    // Small delay between Wikimedia requests to be a good citizen
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`Finished: ${successCount}/${itemsToDownload.length} photos downloaded successfully.`);
}

main();
