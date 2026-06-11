import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  createImageToVideoTask,
  waitForRunwayTask,
} from './runway-client.mjs';

const options = parseArgs(process.argv.slice(2));

const promptText = options.prompt || options.promptText;
const promptImage = options.promptImage || '';
const outputPath = options.out || 'assets/runway/latest.mp4';
const taskJsonPath = options.taskJson || 'assets/runway/latest-task.json';
const ratio = options.ratio || '1280:720';
const duration = Number(options.duration || 5);
const seed = options.seed;

const task = await createImageToVideoTask({
  promptText,
  promptImage,
  ratio,
  duration,
  seed,
});

console.log(`Started Runway task ${task.id}`);

const completedTask = await waitForRunwayTask({
  taskId: task.id,
});

await writeJson(taskJsonPath, completedTask);

if (String(completedTask.status || '').toUpperCase() !== 'SUCCEEDED') {
  throw new Error(`Runway task ${task.id} ended with status ${completedTask.status}`);
}

const outputUrl = Array.isArray(completedTask.output) ? completedTask.output[0] : '';
if (!outputUrl) {
  throw new Error(`Runway task ${task.id} succeeded without an output URL.`);
}

const mediaResponse = await fetch(outputUrl);
if (!mediaResponse.ok) {
  throw new Error(`Failed to download Runway output: ${mediaResponse.status}`);
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, Buffer.from(await mediaResponse.arrayBuffer()));
console.log(`Wrote ${outputPath}`);

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      continue;
    }
    const key = arg.slice(2);
    const next = args[index + 1];
    if (next === undefined || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
