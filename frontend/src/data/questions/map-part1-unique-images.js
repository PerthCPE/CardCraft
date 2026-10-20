const fs = require('fs');
const path = require('path');

const fePath = path.resolve(__dirname, '../toeic-questions.json');
const bePath = path.resolve(__dirname, '../../../../backend/prisma/data/toeic-questions.json');
const imagesDir = path.resolve(__dirname, '../../../public/images/toeic');

const allQuestions = JSON.parse(fs.readFileSync(fePath, 'utf8'));

// Exact 1:1 image assignment for all 66 Part 1 questions
const part1ImageMap = {
  // 1-16 (Original 16)
  'q-list-p1-01': '/images/toeic/part1-p01-document-review.jpg',
  'q-list-p1-02': '/images/toeic/part1-warehouse.svg',
  'q-list-p1-03': '/images/toeic/part1-cafe.svg',
  'q-list-p1-04': '/images/toeic/part1-airport.svg',
  'q-list-p1-05': '/images/toeic/part1-p05-factory-controls.jpg',
  'q-list-p1-06': '/images/toeic/part1-presentation.svg',
  'q-list-p1-07': '/images/toeic/part1-desk-typing.svg',
  'q-list-p1-08': '/images/toeic/part1-engineers-blueprint.svg',
  'q-list-p1-09': '/images/toeic/part1-p09-cashier-checkout.jpg',
  'q-list-p1-10': '/images/toeic/part1-library-bookshelves.svg',
  'q-list-p1-11': '/images/toeic/part1-harbor-containers.svg',
  'q-list-p1-12': '/images/toeic/part1-auditorium-audience.svg',
  'q-list-p1-13': '/images/toeic/part1-p13-scientist-microscope.jpg',
  'q-list-p1-14': '/images/toeic/part1-table-settings.svg',
  'q-list-p1-15': '/images/toeic/part1-parking-lot.svg',
  'q-list-p1-16': '/images/toeic/part1-office-corridor.svg',

  // 17-66 (50 Extended Questions)
  'q-list-p1-ext-01': '/images/toeic/part1-boardroom-timeline.jpg',
  'q-list-p1-ext-02': '/images/toeic/part1-board-chart.svg',
  'q-list-p1-ext-03': '/images/toeic/part1-boardroom.svg',
  'q-list-p1-ext-04': '/images/toeic/part1-timeline-pointing.svg',
  'q-list-p1-ext-05': '/images/toeic/part1-meeting-standing.svg',

  'q-list-p1-ext-06': '/images/toeic/part1-warehouse-forklift.jpg',
  'q-list-p1-ext-07': '/images/toeic/part1-warehouse-racks.svg',
  'q-list-p1-ext-08': '/images/toeic/part1-safety-vest.svg',
  'q-list-p1-ext-09': '/images/toeic/part1-pallet-transport.svg',
  'q-list-p1-ext-10': '/images/toeic/part1-tall-shelving.svg',

  'q-list-p1-ext-11': '/images/toeic/part1-construction-engineers.jpg',
  'q-list-p1-ext-12': '/images/toeic/part1-hard-hats.svg',
  'q-list-p1-ext-13': '/images/toeic/part1-steel-structure.svg',
  'q-list-p1-ext-14': '/images/toeic/part1-document-gesture.svg',
  'q-list-p1-ext-15': '/images/toeic/part1-reflective-vests.svg',

  'q-list-p1-ext-16': '/images/toeic/part1-modern-library.jpg',
  'q-list-p1-ext-17': '/images/toeic/part1-volumes-vertical.svg',
  'q-list-p1-ext-18': '/images/toeic/part1-illuminated-aisle.svg',
  'q-list-p1-ext-19': '/images/toeic/part1-browsing-titles.svg',
  'q-list-p1-ext-20': '/images/toeic/part1-neat-rows-books.svg',

  'q-list-p1-ext-21': '/images/toeic/part1-airport-departure.jpg',
  'q-list-p1-ext-22': '/images/toeic/part1-overhead-screens.svg',
  'q-list-p1-ext-23': '/images/toeic/part1-polished-floor.svg',
  'q-list-p1-ext-24': '/images/toeic/part1-terminal-corridor.svg',
  'q-list-p1-ext-25': '/images/toeic/part1-travelers-luggage.svg',

  'q-list-p1-ext-26': '/images/toeic/part1-supermarket-produce.jpg',
  'q-list-p1-ext-27': '/images/toeic/part1-open-bins.svg',
  'q-list-p1-ext-28': '/images/toeic/part1-selecting-items.svg',
  'q-list-p1-ext-29': '/images/toeic/part1-overhead-lighting.svg',
  'q-list-p1-ext-30': '/images/toeic/part1-fruits-vegetables.svg',

  'q-list-p1-ext-31': '/images/toeic/part1-cafe-patio.jpg',
  'q-list-p1-ext-32': '/images/toeic/part1-beverage-cups.svg',
  'q-list-p1-ext-33': '/images/toeic/part1-conversing-tables.svg',
  'q-list-p1-ext-34': '/images/toeic/part1-pedestrian-walkway.svg',
  'q-list-p1-ext-35': '/images/toeic/part1-large-umbrellas.svg',

  'q-list-p1-ext-36': '/images/toeic/part1-office-presentation.jpg',
  'q-list-p1-ext-37': '/images/toeic/part1-visual-slide.svg',
  'q-list-p1-ext-38': '/images/toeic/part1-audience-seated.svg',
  'q-list-p1-ext-39': '/images/toeic/part1-laptops-table.svg',
  'q-list-p1-ext-40': '/images/toeic/part1-standing-speaker.svg',

  'q-list-p1-ext-41': '/images/toeic/part1-laboratory-research.jpg',
  'q-list-p1-ext-42': '/images/toeic/part1-glassware-workbench.svg',
  'q-list-p1-ext-43': '/images/toeic/part1-white-labcoat.svg',
  'q-list-p1-ext-44': '/images/toeic/part1-scientific-instruments.svg',
  'q-list-p1-ext-45': '/images/toeic/part1-optical-instrument.svg',

  'q-list-p1-ext-46': '/images/toeic/part1-factory.svg',
  'q-list-p1-ext-47': '/images/toeic/part1-machinery-line.svg',
  'q-list-p1-ext-48': '/images/toeic/part1-operator-control.svg',
  'q-list-p1-ext-49': '/images/toeic/part1-protective-gear.svg',
  'q-list-p1-ext-50': '/images/toeic/part1-clean-production.svg'
};

// Check that all 66 mapped image files exist on disk
const usedImages = new Set();
for (const [qId, imgUrl] of Object.entries(part1ImageMap)) {
  const relPath = imgUrl.replace('/images/toeic/', '');
  const absPath = path.join(imagesDir, relPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File does not exist: ${absPath} for ${qId}`);
  }
  if (usedImages.has(imgUrl)) {
    throw new Error(`Duplicate image assignment detected: ${imgUrl} for ${qId}`);
  }
  usedImages.add(imgUrl);
}

console.log(`Validation PASSED: All 66 Part 1 questions mapped to ${usedImages.size} completely unique image files.`);

// Update all questions
const updatedQuestions = allQuestions.map((q) => {
  if (q.part === 1 && part1ImageMap[q.id]) {
    return {
      ...q,
      imageUrl: part1ImageMap[q.id]
    };
  }
  return q;
});

// Write to frontend
fs.writeFileSync(fePath, JSON.stringify(updatedQuestions, null, 2), 'utf8');
console.log(`Updated frontend JSON: ${fePath}`);

// Write to backend
fs.writeFileSync(bePath, JSON.stringify(updatedQuestions, null, 2), 'utf8');
console.log(`Updated backend JSON: ${bePath}`);
