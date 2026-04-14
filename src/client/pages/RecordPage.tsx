import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { modelenceMutation } from '@modelence/react-query';
import {
  Mic,
  FileText,
  MessageSquare,
  Mail,
  Square,
  Loader2,
  ArrowLeft,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24h-2.19L17.61 20.643z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.774-.773 1.774-1.73V1.729C24 .774 23.205 0 22.225 0z" />
  </svg>
);

export default function RecordPage() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { mutateAsync: uploadAudio } = useMutation({
    ...modelenceMutation<{ uploadUrl: string }>('transcription.uploadAudio'),
  });

  const { mutateAsync: startTranscription } = useMutation({
    ...modelenceMutation<{ transcriptId: string }>('transcription.startTranscription'),
  });

  const { mutateAsync: getTranscriptionResult } = useMutation({
    ...modelenceMutation<{ status: string; text?: string; error?: string }>('transcription.getTranscriptionResult'),
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pollForResult = useCallback(async (transcriptId: string): Promise<string> => {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const result = await getTranscriptionResult({ transcriptId });

      if (result.status === 'completed') {
        return result.text || '';
      } else if (result.status === 'error') {
        throw new Error(result.error || 'Transcription failed');
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;
    }

    throw new Error('Transcription timed out');
  }, [getTranscriptionResult]);

  const processAudio = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      toast.loading('Uploading audio...', { id: 'transcription' });
      const { uploadUrl } = await uploadAudio({ audioData: base64 });

      toast.loading('Starting transcription...', { id: 'transcription' });
      const { transcriptId } = await startTranscription({ audioUrl: uploadUrl });

      toast.loading('Transcribing your audio...', { id: 'transcription' });
      const text = await pollForResult(transcriptId);

      toast.success('Transcription complete!', { id: 'transcription' });

      navigate('/result', { state: { text, format: 'twitter', isNewRecording: true } });
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error(error instanceof Error ? error.message : 'Transcription failed', { id: 'transcription' });
    } finally {
      setIsProcessing(false);
    }
  }, [uploadAudio, startTranscription, pollForResult, navigate]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        processAudio(audioBlob);
      };

      mediaRecorder.start(1000); // Collect data every second for pause support
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to access microphone. Please allow microphone access.');
    }
  }, [processAudio]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast.success('Recording paused');
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording resumed');
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const restartRecording = useCallback(() => {
    // Stop current recording without processing
    if (mediaRecorderRef.current && isRecording) {
      // Remove the onstop handler temporarily to prevent processing
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      audioChunksRef.current = [];

      toast.success('Recording discarded');

      // Start new recording after a brief delay
      setTimeout(() => {
        startRecording();
      }, 100);
    }
  }, [isRecording, startRecording]);

  const handleRecordClick = () => {
    if (isProcessing) return;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePauseResumeClick = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#050505] to-[#0a0a0a] text-white selection:bg-yellow-500/30 font-sans tracking-tight">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#666] hover:text-yellow-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <svg viewBox="0 0 100 40" className="h-6 sm:h-8 w-auto text-white fill-none stroke-current stroke-[1.5]">
              <path d="M10 20 L25 20 L32 8 L45 32 L52 20 L80 20" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="w-16 sm:w-20"></div>
        </div>
      </nav>

      {/* Recording Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-32 px-4 sm:px-6 overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Background glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[1000px] h-[500px] sm:h-[1000px] blur-[100px] sm:blur-[160px] rounded-full pointer-events-none transition-colors duration-500 ${isRecording && !isPaused ? 'bg-red-600/15' : isPaused ? 'bg-orange-500/15' : 'bg-yellow-500/10'}`}></div>

        {/* Secondary glow for depth */}
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] blur-[120px] rounded-full pointer-events-none bg-purple-500/5"></div>
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] blur-[120px] rounded-full pointer-events-none bg-blue-500/5"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">
              {isRecording ? (
                <span className="text-red-400">Listening to you...</span>
              ) : isProcessing ? (
                <span className="text-yellow-400">Working on it...</span>
              ) : (
                <>Speak your <span className="text-yellow-400">mind</span></>
              )}
            </h2>
            <p className="text-[#666] text-sm sm:text-lg max-w-md mx-auto">
              {isRecording
                ? "Take your time. We'll capture every word."
                : isProcessing
                ? "Converting your voice into polished content."
                : "Record once, export to any format you need."}
            </p>
          </motion.div>

          {/* Format display - same style as landing page but non-selectable */}
          <p className="text-[#444] text-xs sm:text-sm mb-4">
            We can help you create content for
          </p>
          <div className="flex justify-center items-center gap-0.5 sm:gap-1 mb-10 sm:mb-16 bg-[#111]/40 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl w-fit mx-auto border border-white/10 shadow-2xl overflow-x-auto max-w-full">
            <div className="px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 flex-shrink-0 text-[#666]">
              <FileText className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-medium hidden xs:inline">Notes</span>
            </div>
            <div className="px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 flex-shrink-0 text-[#666]">
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-medium hidden xs:inline">Message</span>
            </div>
            <div className="px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 flex-shrink-0 text-[#666]">
              <XIcon className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-medium hidden xs:inline">X Post</span>
            </div>
            <div className="px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 flex-shrink-0 text-[#666]">
              <LinkedinIcon className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-medium hidden xs:inline">LinkedIn</span>
            </div>
            <div className="px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 flex-shrink-0 text-[#666]">
              <Mail className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-medium hidden xs:inline">Email</span>
            </div>
          </div>

          {/* Recording Circle */}
          <div className="relative w-64 h-64 sm:w-96 sm:h-96 mx-auto mb-8 sm:mb-16 flex items-center justify-center">
            {/* Concentric rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isRecording && !isPaused ? [1, 1.3, 1] : [1, 1.2, 1],
                  opacity: isRecording && !isPaused ? [0.2 + i * 0.1, 0.1, 0.2 + i * 0.1] : [0.1 + i * 0.05, 0.05, 0.1 + i * 0.05]
                }}
                transition={{ duration: isRecording && !isPaused ? 1.5 : 6, repeat: Infinity, delay: i * (isRecording && !isPaused ? 0.5 : 2), ease: "easeInOut" }}
                className={`absolute inset-0 border rounded-full ${isRecording && !isPaused ? 'border-red-500/40' : isPaused ? 'border-orange-500/40' : 'border-yellow-500/20'}`}
              />
            ))}

            {/* Wave lines circling around */}
            <div className={`absolute inset-0 opacity-20 ${isPaused ? 'animate-none' : ''}`}>
              <svg viewBox="0 0 100 100" className={`w-full h-full ${isPaused ? '' : 'animate-[spin_20s_linear_infinite]'}`}>
                <circle cx="50" cy="50" r="48" stroke={isRecording && !isPaused ? 'url(#gradient-red)' : isPaused ? 'url(#gradient-orange)' : 'url(#gradient)'} strokeWidth="0.5" fill="none" strokeDasharray="10 20" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                  <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                  <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {isRecording ? (
              /* When recording: show restart, pause/resume and stop buttons */
              <div className="relative flex items-center gap-4 sm:gap-6">
                {/* Restart button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={restartRecording}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 border rounded-full flex items-center justify-center shadow-inner transition-colors bg-zinc-700 border-zinc-600 hover:bg-zinc-600"
                >
                  <div className="absolute inset-[1px] rounded-full bg-gradient-to-b from-white/10 to-transparent"></div>
                  <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
                </motion.button>

                {/* Stop button */}
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 blur-3xl transition-all duration-300 bg-red-500 opacity-40"></div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRecordClick}
                    className="relative w-20 h-20 sm:w-28 sm:h-28 border rounded-full flex items-center justify-center shadow-inner transition-colors bg-red-600 border-red-500"
                  >
                    <div className="absolute inset-[1px] rounded-full bg-gradient-to-b from-white/5 to-transparent"></div>
                    <Square className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 fill-current" />
                  </motion.button>
                </div>

                {/* Pause/Resume button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePauseResumeClick}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 border rounded-full flex items-center justify-center shadow-inner transition-colors ${
                    isPaused
                      ? 'bg-green-600 border-green-500'
                      : 'bg-orange-500 border-orange-400'
                  }`}
                >
                  <div className="absolute inset-[1px] rounded-full bg-gradient-to-b from-white/10 to-transparent"></div>
                  {isPaused ? (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 fill-current" />
                  ) : (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 fill-current" />
                  )}
                </motion.button>
              </div>
            ) : (
              /* When not recording: show mic button */
              <div className="relative group cursor-pointer">
                <div className={`absolute inset-0 blur-3xl transition-all duration-300 ${isProcessing ? 'bg-yellow-500 opacity-10' : 'bg-yellow-500 opacity-20 group-hover:opacity-40'}`}></div>
                <motion.button
                  whileHover={{ scale: isProcessing ? 1 : 1.05 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.95 }}
                  onClick={handleRecordClick}
                  disabled={isProcessing}
                  className={`relative w-20 h-20 sm:w-28 sm:h-28 border rounded-full flex items-center justify-center shadow-inner transition-colors ${
                    isProcessing
                      ? 'bg-[#0a0a0a] border-white/10 cursor-not-allowed'
                      : 'bg-[#0a0a0a] border-white/10'
                  }`}
                >
                  <div className="absolute inset-[1px] rounded-full bg-gradient-to-b from-white/5 to-transparent"></div>
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white relative z-10 animate-spin" />
                  ) : (
                    <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-white relative z-10" />
                  )}
                </motion.button>
              </div>
            )}

            {/* Waveform visualization */}
            <div className="hidden sm:flex absolute left-full ml-12 right-[-100%] top-1/2 -translate-y-1/2 pointer-events-none opacity-20 overflow-hidden h-24 items-center">
              <div className="flex gap-1.5 h-full items-center">
                {[...Array(40)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isPaused ? 30 : isRecording ? [20, 80, 30, 90, 25] : [10, 40, 20, 70, 15] }}
                    transition={{ duration: isPaused ? 0 : isRecording ? 0.5 : 3, repeat: isPaused ? 0 : Infinity, delay: i * 0.05, ease: "easeInOut" }}
                    className={`w-[2px] rounded-full ${isRecording && !isPaused ? 'bg-red-400' : isPaused ? 'bg-orange-400' : 'bg-white'}`}
                  />
                ))}
              </div>
            </div>
            <div className="hidden sm:flex absolute right-full mr-12 left-[-100%] top-1/2 -translate-y-1/2 pointer-events-none opacity-20 overflow-hidden h-24 items-center justify-end">
              <div className="flex gap-1.5 h-full items-center">
                {[...Array(40)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isPaused ? 30 : isRecording ? [25, 70, 35, 85, 20] : [15, 60, 10, 40, 20] }}
                    transition={{ duration: isPaused ? 0 : isRecording ? 0.5 : 3, repeat: isPaused ? 0 : Infinity, delay: (40 - i) * 0.05, ease: "easeInOut" }}
                    className={`w-[2px] rounded-full ${isRecording && !isPaused ? 'bg-red-400' : isPaused ? 'bg-orange-400' : 'bg-white'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Recording time / Status */}
          <div className="space-y-3">
            <p className={`font-medium tracking-wide text-sm sm:text-base ${isPaused ? 'text-orange-400' : isRecording ? 'text-red-400' : 'text-[#666]'}`}>
              {isPaused ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Paused at {formatTime(recordingTime)}
                </span>
              ) : isRecording ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  {formatTime(recordingTime)}
                </span>
              ) : isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing your recording...
                </span>
              ) : (
                'Ready when you are'
              )}
            </p>

            {/* Tip text */}
            {!isRecording && !isProcessing && (
              <p className="text-[#333] text-xs">
                Tip: Speak naturally. You can pause anytime and continue later.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
