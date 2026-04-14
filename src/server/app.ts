import { startApp } from 'modelence/server';
import transcriptionModule from '@/server/transcription';
import contentModule from '@/server/content';

startApp({
  modules: [transcriptionModule, contentModule],

  security: {
    frameAncestors: ['https://modelence.com', 'https://*.modelence.com', 'http://localhost:*'],
  },
});
