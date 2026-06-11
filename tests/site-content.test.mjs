import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('homepage uses the supplied Runway video as the hero', async () => {
  const html = await readFile('index.html', 'utf8');

  assert.match(html, /id="heroVideo"/);
  assert.match(html, /Know Before You Go™/);
  assert.doesNotMatch(html, /Know your level/);
  assert.doesNotMatch(html, /Keep your cool/);
  assert.match(html, /src="assets\/runway\/latest\.mp4"/);
  assert.match(html, /autoplay/);
  assert.match(html, /loop/);
  assert.match(html, /muted/);
  assert.match(html, /playsinline/);
  assert.match(html, /poster="assets\/media\/bacrub-product-bac-screen\.png"/);
  assert.doesNotMatch(html, /id="runwayVisual"/);
});

test('homepage uses the Bacrub BAC-screen product image below the hero', async () => {
  const html = await readFile('index.html', 'utf8');

  assert.match(html, /id="productProof"/);
  assert.match(html, /data-runway-src="assets\/runway\/latest\.mp4"/);
  assert.match(html, /assets\/media\/bacrub-product-bac-screen\.png/);
  assert.match(html, /alt="Bacrub pen breathalyzer with BAC reading on the screen and massage end cap"/);
});

test('features include the calendar pen visual', async () => {
  const html = await readFile('index.html', 'utf8');

  assert.match(html, /assets\/media\/bacrub-calendar-pen\.png/);
  assert.match(html, /alt="Bacrub pen on a calendar with know before you go message"/);
  assert.match(html, /Know before you go/);
});

test('site uses the BACRUB wordmark styling and tagline', async () => {
  const html = await readFile('index.html', 'utf8');

  assert.match(html, /<span class="text-white">BAC<\/span><span class="text-cyan-500">RUB<\/span>/);
  assert.match(html, /KNOW BEFORE YOU GO\./);
});

test('homepage infers the Bacrub brand system without showing a brand guide', async () => {
  const html = await readFile('index.html', 'utf8');

  assert.doesNotMatch(html, /id="brandGuide"/);
  assert.doesNotMatch(html, />Brand guide</);
  assert.doesNotMatch(html, /assets\/media\/bacrub-brand-board\.png/);
  assert.match(html, /id="decisionSystem"/);
  assert.match(html, /clarity tool/);
  assert.match(html, /Confidence, clarity, and better decisions/);
  assert.match(html, /Three tools\. One purpose\./);
  assert.doesNotMatch(html, /We Are/);
  assert.doesNotMatch(html, /We Are Not/);
  assert.match(html, /Go/);
  assert.match(html, /React/);
  assert.match(html, /Act/);
  assert.match(html, /create clarity before action/);
});

test('homepage uses the Know Before pillar story', async () => {
  const html = await readFile('index.html', 'utf8');

  assert.match(html, /Know Before You Go™/);
  assert.match(html, /Know Before You React™/);
  assert.match(html, /Know Before You Act™/);
  assert.match(html, /Three tools\. One purpose\./);
  assert.match(html, /Clarity\./);
  assert.match(html, /The pen captures your thoughts/);
  assert.match(html, /somatic acupressure massager/);
  assert.match(html, /replaces guessing with certainty/);
  assert.match(html, /Breathalyzer verification/);
  assert.doesNotMatch(html, /tactile grip/);
  assert.doesNotMatch(html, /Start with interest\. Validate before you build the full funnel\./);
  assert.doesNotMatch(html, /This GitHub Pages version is ready/);
  assert.doesNotMatch(html, /Launch-ready narrative/);
  assert.doesNotMatch(html, /concept page/);
  assert.doesNotMatch(html, /investor deck/);
});
