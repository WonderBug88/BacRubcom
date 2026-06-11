export const DEFAULT_RUNWAY_BASE_URL = 'https://api.dev.runwayml.com/v1';
export const DEFAULT_RUNWAY_VERSION = '2024-11-06';
export const DEFAULT_VIDEO_MODEL = 'gen4.5';
export const DEFAULT_VIDEO_RATIO = '1280:720';
export const DEFAULT_VIDEO_DURATION = 5;
export const TERMINAL_STATUSES = new Set(['SUCCEEDED', 'FAILED', 'CANCELED']);

export class RunwayApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RunwayApiError';
  }
}

export function buildImageToVideoPayload({
  promptText,
  promptImage,
  model = DEFAULT_VIDEO_MODEL,
  ratio = DEFAULT_VIDEO_RATIO,
  duration = DEFAULT_VIDEO_DURATION,
  seed,
}) {
  const cleanPrompt = String(promptText || '').trim();
  if (!cleanPrompt) {
    throw new Error('promptText is required.');
  }

  const numericDuration = Number(duration);
  if (!Number.isInteger(numericDuration) || numericDuration <= 0) {
    throw new Error('duration must be a positive integer.');
  }

  const payload = {
    model,
    promptText: cleanPrompt,
    ratio,
    duration: numericDuration,
  };

  if (promptImage) {
    payload.promptImage = promptImage;
  }

  if (seed !== undefined && seed !== null && seed !== '') {
    const numericSeed = Number(seed);
    if (!Number.isInteger(numericSeed) || numericSeed < 0 || numericSeed > 4294967295) {
      throw new Error('seed must be an integer between 0 and 4294967295.');
    }
    payload.seed = numericSeed;
  }

  return payload;
}

export function buildRunwayHeaders({
  apiSecret = process.env.RUNWAYML_API_SECRET,
  apiVersion = process.env.RUNWAY_API_VERSION || DEFAULT_RUNWAY_VERSION,
} = {}) {
  const cleanSecret = String(apiSecret || '').trim();
  if (!cleanSecret) {
    throw new RunwayApiError('RUNWAYML_API_SECRET is required before calling the Runway API.');
  }

  return {
    Authorization: `Bearer ${cleanSecret}`,
    'Content-Type': 'application/json',
    'X-Runway-Version': apiVersion,
  };
}

export async function createImageToVideoTask({
  apiSecret = process.env.RUNWAYML_API_SECRET,
  apiVersion = process.env.RUNWAY_API_VERSION || DEFAULT_RUNWAY_VERSION,
  baseUrl = process.env.RUNWAY_API_BASE_URL || DEFAULT_RUNWAY_BASE_URL,
  fetchImpl = globalThis.fetch,
  ...request
}) {
  if (!fetchImpl) {
    throw new RunwayApiError('A fetch implementation is required.');
  }

  const response = await fetchImpl(`${trimTrailingSlash(baseUrl)}/image_to_video`, {
    method: 'POST',
    headers: buildRunwayHeaders({ apiSecret, apiVersion }),
    body: JSON.stringify(buildImageToVideoPayload(request)),
  });

  return parseRunwayResponse(response);
}

export async function retrieveRunwayTask({
  taskId,
  apiSecret = process.env.RUNWAYML_API_SECRET,
  apiVersion = process.env.RUNWAY_API_VERSION || DEFAULT_RUNWAY_VERSION,
  baseUrl = process.env.RUNWAY_API_BASE_URL || DEFAULT_RUNWAY_BASE_URL,
  fetchImpl = globalThis.fetch,
}) {
  const cleanTaskId = String(taskId || '').trim();
  if (!cleanTaskId) {
    throw new Error('taskId is required.');
  }
  if (!fetchImpl) {
    throw new RunwayApiError('A fetch implementation is required.');
  }

  const response = await fetchImpl(`${trimTrailingSlash(baseUrl)}/tasks/${encodeURIComponent(cleanTaskId)}`, {
    method: 'GET',
    headers: buildRunwayHeaders({ apiSecret, apiVersion }),
  });

  return parseRunwayResponse(response);
}

export async function waitForRunwayTask({
  taskId,
  timeoutMs = 10 * 60 * 1000,
  pollIntervalMs = 5000,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  ...options
}) {
  const deadline = Date.now() + Math.max(Number(timeoutMs), 0);

  while (true) {
    const task = await retrieveRunwayTask({ taskId, ...options });
    const status = String(task.status || '').toUpperCase();
    if (TERMINAL_STATUSES.has(status)) {
      return task;
    }
    if (Date.now() >= deadline) {
      throw new RunwayApiError(`Runway task ${taskId} did not finish before timeout.`);
    }
    await sleep(Math.max(Number(pollIntervalMs) || 5000, 5000));
  }
}

export async function parseRunwayResponse(response) {
  const payload = await responseJson(response);
  if (!response.ok) {
    const detail = safeErrorDetail(payload) || await safeResponseText(response) || 'No response body';
    throw new RunwayApiError(`Runway API request failed with status ${response.status}: ${detail}`);
  }
  return payload;
}

function trimTrailingSlash(value) {
  return String(value || DEFAULT_RUNWAY_BASE_URL).replace(/\/+$/, '');
}

async function responseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function safeResponseText(response) {
  if (typeof response.text !== 'function') {
    return '';
  }
  try {
    return String(await response.text()).slice(0, 160);
  } catch {
    return '';
  }
}

function safeErrorDetail(payload) {
  if (!payload || typeof payload !== 'object') {
    return '';
  }
  for (const key of ['error', 'message', 'detail']) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim().slice(0, 160);
    }
  }
  return '';
}
