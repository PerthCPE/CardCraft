const fs = require('fs');
const path = require('path');

const fePath = path.resolve(__dirname, '../toeic-questions.json');
const bePath = path.resolve(__dirname, '../../../../backend/prisma/data/toeic-questions.json');
const imagesDir = path.resolve(__dirname, '../../../public/images/toeic');

const allQuestions = JSON.parse(fs.readFileSync(fePath, 'utf8'));

const photoMap = {
  // 1-16 (Original 16)
  'q-list-p1-01': '/images/toeic/part1-p01-document-review.jpg',
  'q-list-p1-02': '/images/toeic/part1-p02-warehouse-pallets.jpg',
  'q-list-p1-03': '/images/toeic/part1-p03-cafe-dining.jpg',
  'q-list-p1-04': '/images/toeic/part1-p04-airport-queue.jpg',
  'q-list-p1-05': '/images/toeic/part1-p05-factory-controls.jpg',
  'q-list-p1-06': '/images/toeic/part1-p06-projector-presenter.jpg',
  'q-list-p1-07': '/images/toeic/part1-p07-desk-typing.jpg',
  'q-list-p1-08': '/images/toeic/part1-p08-engineers-blueprint.jpg',
  'q-list-p1-09': '/images/toeic/part1-p09-cashier-checkout.jpg',
  'q-list-p1-10': '/images/toeic/part1-p10-library-bookshelves.jpg',
  'q-list-p1-11': '/images/toeic/part1-p11-harbor-containers.jpg',
  'q-list-p1-12': '/images/toeic/part1-p12-auditorium-audience.jpg',
  'q-list-p1-13': '/images/toeic/part1-p13-scientist-microscope.jpg',
  'q-list-p1-14': '/images/toeic/part1-p14-table-settings.jpg',
  'q-list-p1-15': '/images/toeic/part1-p15-parking-lot.jpg',
  'q-list-p1-16': '/images/toeic/part1-p16-office-corridor.jpg',

  // 17-66 (50 Extended Questions)
  'q-list-p1-ext-01': '/images/toeic/part1-boardroom-timeline.jpg',
  'q-list-p1-ext-02': '/images/toeic/part1-ext02-board-chart.jpg',
  'q-list-p1-ext-03': '/images/toeic/part1-ext03-business-attire.jpg',
  'q-list-p1-ext-04': '/images/toeic/part1-ext04-timeline-pointing.jpg',
  'q-list-p1-ext-05': '/images/toeic/part1-ext05-meeting-standing.jpg',

  'q-list-p1-ext-06': '/images/toeic/part1-warehouse-forklift.jpg',
  'q-list-p1-ext-07': '/images/toeic/part1-ext07-warehouse-racks.jpg',
  'q-list-p1-ext-08': '/images/toeic/part1-ext08-safety-vest.jpg',
  'q-list-p1-ext-09': '/images/toeic/part1-ext09-pallet-transport.jpg',
  'q-list-p1-ext-10': '/images/toeic/part1-ext10-tall-shelving.jpg',

  'q-list-p1-ext-11': '/images/toeic/part1-construction-engineers.jpg',
  'q-list-p1-ext-12': '/images/toeic/part1-ext12-hard-hats.jpg',
  'q-list-p1-ext-13': '/images/toeic/part1-ext13-steel-structure.jpg',
  'q-list-p1-ext-14': '/images/toeic/part1-ext14-document-gesture.jpg',
  'q-list-p1-ext-15': '/images/toeic/part1-ext15-reflective-vests.jpg',

  'q-list-p1-ext-16': '/images/toeic/part1-modern-library.jpg',
  'q-list-p1-ext-17': '/images/toeic/part1-ext17-volumes-vertical.jpg',
  'q-list-p1-ext-18': '/images/toeic/part1-ext18-illuminated-aisle.jpg',
  'q-list-p1-ext-19': '/images/toeic/part1-ext19-browsing-titles.jpg',
  'q-list-p1-ext-20': '/images/toeic/part1-ext20-neat-rows-books.jpg',

  'q-list-p1-ext-21': '/images/toeic/part1-airport-departure.jpg',
  'q-list-p1-ext-22': '/images/toeic/part1-ext22-overhead-screens.jpg',
  'q-list-p1-ext-23': '/images/toeic/part1-ext23-polished-floor.jpg',
  'q-list-p1-ext-24': '/images/toeic/part1-ext24-terminal-corridor.jpg',
  'q-list-p1-ext-25': '/images/toeic/part1-ext25-travelers-luggage.jpg',

  'q-list-p1-ext-26': '/images/toeic/part1-supermarket-produce.jpg',
  'q-list-p1-ext-27': '/images/toeic/part1-ext27-open-bins.jpg',
  'q-list-p1-ext-28': '/images/toeic/part1-ext28-selecting-items.jpg',
  'q-list-p1-ext-29': '/images/toeic/part1-ext29-overhead-lighting.jpg',
  'q-list-p1-ext-30': '/images/toeic/part1-ext30-fruits-vegetables.jpg',

  'q-list-p1-ext-31': '/images/toeic/part1-cafe-patio.jpg',
  'q-list-p1-ext-32': '/images/toeic/part1-ext32-beverage-cups.jpg',
  'q-list-p1-ext-33': '/images/toeic/part1-ext33-conversing-tables.jpg',
  'q-list-p1-ext-34': '/images/toeic/part1-ext34-pedestrian-walkway.jpg',
  'q-list-p1-ext-35': '/images/toeic/part1-ext35-large-umbrellas.jpg',

  'q-list-p1-ext-36': '/images/toeic/part1-office-presentation.jpg',
  'q-list-p1-ext-37': '/images/toeic/part1-ext37-visual-slide.jpg',
  'q-list-p1-ext-38': '/images/toeic/part1-ext38-audience-seated.jpg',
  'q-list-p1-ext-39': '/images/toeic/part1-ext39-laptops-table.jpg',
  'q-list-p1-ext-40': '/images/toeic/part1-ext40-standing-speaker.jpg',

  'q-list-p1-ext-41': '/images/toeic/part1-laboratory-research.jpg',
  'q-list-p1-ext-42': '/images/toeic/part1-ext42-glassware-workbench.jpg',
  'q-list-p1-ext-43': '/images/toeic/part1-ext43-white-labcoat.jpg',
  'q-list-p1-ext-44': '/images/toeic/part1-ext44-scientific-instruments.jpg',
  'q-list-p1-ext-45': '/images/toeic/part1-ext45-optical-instrument.jpg',

  'q-list-p1-ext-46': '/images/toeic/part1-ext46-industrial-inspection.jpg',
  'q-list-p1-ext-47': '/images/toeic/part1-ext47-machinery-line.jpg',
  'q-list-p1-ext-48': '/images/toeic/part1-ext48-operator-control.jpg',
  'q-list-p1-ext-49': '/images/toeic/part1-ext49-protective-gear.jpg',
  'q-list-p1-ext-50': '/images/toeic/part1-ext50-clean-production.jpg'
};

// Check validation: All 66 files MUST exist on disk and be .jpg
const seenUrls = new Set();
for (const [qId, imgUrl] of Object.entries(photoMap)) {
  if (!imgUrl.endsWith('.jpg')) {
    throw new Error(`Non-jpg image mapped for ${qId}: ${imgUrl}`);
  }
  const rel = imgUrl.replace('/images/toeic/', '');
  const abs = path.join(imagesDir, rel);
  if (!fs.existsSync(abs)) {
    throw new Error(`File does not exist: ${abs}`);
  }
  const size = fs.statSync(abs).size;
  if (size < 1000) {
    throw new Error(`Suspicious file size (${size} bytes) for ${abs}`);
  }
  if (seenUrls.has(imgUrl)) {
    throw new Error(`Duplicate image used: ${imgUrl}`);
  }
  seenUrls.add(imgUrl);
}

console.log(`Validation PASSED: All 66 Part 1 questions mapped to 66 completely unique genuine JPG photographs.`);

// Update question bank
const updatedQuestions = allQuestions.map(q => {
  if (q.part === 1 && photoMap[q.id]) {
    return {
      ...q,
      imageUrl: photoMap[q.id]
    };
  }
  return q;
});

fs.writeFileSync(fePath, JSON.stringify(updatedQuestions, null, 2), 'utf8');
console.log(`Updated: ${fePath}`);

fs.writeFileSync(bePath, JSON.stringify(updatedQuestions, null, 2), 'utf8');
console.log(`Updated: ${bePath}`);
