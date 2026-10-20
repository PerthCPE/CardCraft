// ============================================================================
// scripts/measure-perf.js
// Script สำหรับวัดเวลาตอบสนอง (Response Time / TTFB) และขนาดข้อมูล (Payload)
// ของหน้าต่างๆ ใน CardCraft ทั้ง Frontend และ Backend API
// รันด้วย: node scripts/measure-perf.js [BASE_URL]
// ============================================================================

const http = require('http');
const https = require('https');

const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const DEFAULT_BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const targetBaseUrl = process.argv[2] || DEFAULT_FRONTEND_URL;

const ROUTES_TO_TEST = [
  { name: 'Dashboard (/)', path: '/' },
  { name: 'Flashcards (/flashcards)', path: '/flashcards' },
  { name: 'Practice Hub (/practice)', path: '/practice' },
  { name: 'Mock Test Lobby (/mock-test)', path: '/mock-test' },
  { name: 'Error Review (/review/errors)', path: '/review/errors' },
];

const API_ENDPOINTS_TO_TEST = [
  { name: 'API: Questions (/questions)', url: `${DEFAULT_BACKEND_URL}/questions` },
  { name: 'API: Flashcards (/flashcards)', url: `${DEFAULT_BACKEND_URL}/flashcards` },
  { name: 'API: Dashboard Summary (/users/dashboard)', url: `${DEFAULT_BACKEND_URL}/users/dashboard` },
];

function fetchMetrics(url) {
  return new Promise((resolve) => {
    const startTime = process.hrtime();
    let ttfbTime = 0;
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      const diffTtfb = process.hrtime(startTime);
      ttfbTime = (diffTtfb[0] * 1e3 + diffTtfb[1] * 1e-6).toFixed(2);

      let bytes = 0;
      res.on('data', (chunk) => {
        bytes += chunk.length;
      });

      res.on('end', () => {
        const diffTotal = process.hrtime(startTime);
        const totalDuration = (diffTotal[0] * 1e3 + diffTotal[1] * 1e-6).toFixed(2);
        resolve({
          status: res.statusCode,
          ttfbMs: parseFloat(ttfbTime),
          durationMs: parseFloat(totalDuration),
          sizeKb: (bytes / 1024).toFixed(2),
          cacheHeader: res.headers['cache-control'] || 'none',
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 'CONN_FAIL',
        error: err.message,
        ttfbMs: 0,
        durationMs: 0,
        sizeKb: '0.00',
        cacheHeader: 'none',
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request exceeded 5000ms',
        ttfbMs: 0,
        durationMs: 5000,
        sizeKb: '0.00',
        cacheHeader: 'none',
      });
    });
  });
}

async function runBenchmark() {
  console.log('\n============================================================');
  console.log('  CardCraft Performance & Latency Benchmark Script');
  console.log('============================================================');
  console.log(`Target Frontend URL: ${targetBaseUrl}`);
  console.log(`Target Backend URL:  ${DEFAULT_BACKEND_URL}`);
  console.log('Timestamp:           ' + new Date().toISOString());
  console.log('------------------------------------------------------------\n');

  console.log('▶ วัดผลหน้าเว็บ Frontend:');
  console.table(
    await Promise.all(
      ROUTES_TO_TEST.map(async (route) => {
        const fullUrl = `${targetBaseUrl}${route.path}`;
        const metrics = await fetchMetrics(fullUrl);
        return {
          Route: route.name,
          Status: metrics.status,
          'TTFB (ms)': metrics.ttfbMs,
          'Total Duration (ms)': metrics.durationMs,
          'Transferred (KB)': metrics.sizeKb,
        };
      })
    )
  );

  console.log('\n▶ วัดผล Backend Endpoints:');
  console.table(
    await Promise.all(
      API_ENDPOINTS_TO_TEST.map(async (api) => {
        const metrics = await fetchMetrics(api.url);
        return {
          Endpoint: api.name,
          Status: metrics.status,
          'TTFB (ms)': metrics.ttfbMs,
          'Total Duration (ms)': metrics.durationMs,
          'Payload (KB)': metrics.sizeKb,
          'Cache-Control': metrics.cacheHeader,
        };
      })
    )
  );

  console.log('\n💡 คำแนะนำ:');
  console.log('1. เพื่อวัดผล Lighthouse Core Web Vitals (LCP, TBT, CLS) ให้เปิด Chrome DevTools -> Lighthouse tab');
  console.log('2. บันทึกผลลัพธ์ลงใน docs/perf-baseline.md เพื่อเปรียบเทียบในแต่ละเฟส\n');
}

runBenchmark();
