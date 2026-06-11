import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildImageToVideoPayload,
  buildRunwayHeaders,
  createImageToVideoTask,
  retrieveRunwayTask,
} from '../scripts/runway-client.mjs';

test('buildImageToVideoPayload supports text-to-video by omitting promptImage', () => {
  const payload = buildImageToVideoPayload({
    promptText: 'A cinematic close-up of the Bacrub pen breathalyzer on a bar top',
    ratio: '1280:720',
    duration: 5,
  });

  assert.equal(payload.model, 'gen4.5');
  assert.equal(payload.promptText, 'A cinematic close-up of the Bacrub pen breathalyzer on a bar top');
  assert.equal(payload.ratio, '1280:720');
  assert.equal(payload.duration, 5);
  assert.equal(Object.hasOwn(payload, 'promptImage'), false);
});

test('buildImageToVideoPayload includes promptImage when provided', () => {
  const payload = buildImageToVideoPayload({
    promptText: 'Slow product rotation with a premium nightlife mood',
    promptImage: 'https://example.com/bacrub-reference.jpg',
  });

  assert.equal(payload.promptImage, 'https://example.com/bacrub-reference.jpg');
});

test('buildRunwayHeaders fails without a secret', () => {
  assert.throws(() => buildRunwayHeaders({ apiSecret: '' }), /RUNWAYML_API_SECRET/);
});

test('createImageToVideoTask posts to Runway with versioned headers', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 'task_123' }),
    };
  };

  const task = await createImageToVideoTask({
    apiSecret: 'runway-secret',
    fetchImpl,
    promptText: 'A clean Bacrub product render with subtle blue OLED glow',
  });

  assert.equal(task.id, 'task_123');
  assert.equal(calls[0].url, 'https://api.dev.runwayml.com/v1/image_to_video');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer runway-secret');
  assert.equal(calls[0].init.headers['X-Runway-Version'], '2024-11-06');
  assert.equal(JSON.parse(calls[0].init.body).promptText, 'A clean Bacrub product render with subtle blue OLED glow');
});

test('retrieveRunwayTask uses the task detail endpoint', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 'task_123', status: 'SUCCEEDED' }),
    };
  };

  const task = await retrieveRunwayTask({
    apiSecret: 'runway-secret',
    fetchImpl,
    taskId: 'task_123',
  });

  assert.equal(task.status, 'SUCCEEDED');
  assert.equal(calls[0].url, 'https://api.dev.runwayml.com/v1/tasks/task_123');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer runway-secret');
});

test('Runway HTTP errors are sanitized', async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ error: 'bad secret' }),
    text: async () => 'bad secret',
  });

  await assert.rejects(
    () => createImageToVideoTask({
      apiSecret: 'runway-secret',
      fetchImpl,
      promptText: 'A Bacrub render',
    }),
    /Runway API request failed with status 401: bad secret/,
  );
});
