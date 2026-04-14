import z from 'zod';
import axios from 'axios';
import { Module, getConfig } from 'modelence/server';

const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com';

export default new Module('transcription', {
  configSchema: {
    assemblyAiApiKey: {
      type: 'secret',
      default: '',
      isPublic: false,
    },
  },

  mutations: {
    // Upload audio and get upload URL
    uploadAudio: async (args: unknown) => {
      const { audioData } = z.object({
        audioData: z.string(), // Base64 encoded audio
      }).parse(args);

      const apiKey = getConfig('transcription.assemblyAiApiKey') as string;
      if (!apiKey) {
        throw new Error('AssemblyAI API key not configured. Please set it in the Modelence Config dashboard.');
      }

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioData, 'base64');

      try {
        const uploadResponse = await axios.post(
          `${ASSEMBLYAI_BASE_URL}/v2/upload`,
          audioBuffer,
          {
            headers: {
              authorization: apiKey,
              'Content-Type': 'application/octet-stream',
            },
          }
        );

        return { uploadUrl: uploadResponse.data.upload_url };
      } catch (error: any) {
        console.error('AssemblyAI upload error:', error.response?.data || error.message);
        throw new Error(`Upload failed: ${error.response?.data?.error || error.message}`);
      }
    },

    // Start transcription job
    startTranscription: async (args: unknown) => {
      const { audioUrl } = z.object({
        audioUrl: z.string(),
      }).parse(args);

      const apiKey = getConfig('transcription.assemblyAiApiKey') as string;
      if (!apiKey) {
        throw new Error('AssemblyAI API key not configured. Please set it in the Modelence Config dashboard.');
      }

      try {
        const response = await axios.post(
          `${ASSEMBLYAI_BASE_URL}/v2/transcript`,
          {
            audio_url: audioUrl,
            language_detection: true,
            speech_models: ['universal-2'],
          },
          {
            headers: {
              authorization: apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        return { transcriptId: response.data.id };
      } catch (error: any) {
        console.error('AssemblyAI transcription error:', error.response?.data || error.message);
        throw new Error(`Transcription failed: ${error.response?.data?.error || error.message}`);
      }
    },

    // Poll for transcription result
    getTranscriptionResult: async (args: unknown) => {
      const { transcriptId } = z.object({
        transcriptId: z.string(),
      }).parse(args);

      const apiKey = getConfig('transcription.assemblyAiApiKey') as string;
      if (!apiKey) {
        throw new Error('AssemblyAI API key not configured. Please set it in the Modelence Config dashboard.');
      }

      try {
        const response = await axios.get(
          `${ASSEMBLYAI_BASE_URL}/v2/transcript/${transcriptId}`,
          {
            headers: {
              authorization: apiKey,
            },
          }
        );

        const { status, text, error } = response.data;

        return {
          status,
          text: status === 'completed' ? text : null,
          error: status === 'error' ? error : null,
        };
      } catch (error: any) {
        console.error('AssemblyAI get result error:', error.response?.data || error.message);
        throw new Error(`Failed to get result: ${error.response?.data?.error || error.message}`);
      }
    },
  },
});
