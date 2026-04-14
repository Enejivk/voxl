import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { modelenceMutation } from '@modelence/react-query';
import {
  Mic,
  FileText,
  MessageSquare,
  Plus,
  Copy,
  ArrowUpRight,
  Shield,
  Globe,
  LineChart,
  Zap,
  ChevronDown,
  Layout,
  PenTool,
  Send,
  Mail,
  Square,
  Loader2,
  Pause,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const XIcon = ({ className = "w-4.5 h-4.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24h-2.19L17.61 20.643z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4.5 h-4.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.774-.773 1.774-1.73V1.729C24 .774 23.205 0 22.225 0z" />
  </svg>
);

const VoxlLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16m0-16L4 20" className="opacity-40" />
    <path d="M12 4v16m-8-8h16" className="opacity-60" strokeWidth="1" />
    <circle cx="12" cy="12" r="3" fill="currentColor" className="text-yellow-400 blur-[2px]" />
  </svg>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        className="w-full py-4 sm:py-6 flex justify-between items-center text-left hover:text-yellow-400 transition-colors gap-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-base sm:text-lg font-medium">{question}</span>
        <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-4 sm:pb-6 text-gray-400 leading-relaxed text-sm sm:text-base">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, category }: { icon: any, title: string, description: string, category?: string }) => (
  <div className="bg-white/5 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-yellow-500/50 transition-all group">
    <div className="flex justify-between items-start mb-4 sm:mb-6">
      <div className="bg-yellow-500/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl group-hover:bg-yellow-500/30 transition-colors">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
      </div>
      {category && <span className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-widest">{category}</span>}
    </div>
    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{description}</p>
  </div>
);

const AudienceCard = ({ icon: Icon, title, description, badge }: { icon: any, title: string, description: string, badge: string }) => (
  <div className="bg-zinc-900/50 border border-white/5 p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={60} className="sm:w-20 sm:h-20" />
    </div>
    <div className="relative z-10">
      <div className="bg-yellow-500/20 text-yellow-400 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full w-fit mb-4 sm:mb-6">
        {badge}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{description}</p>
    </div>
  </div>
);

type FormatType = 'notes' | 'message' | 'twitter' | 'linkedin' | 'email';

export default function HomePage() {
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
    const maxAttempts = 60; // 3 minutes max
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
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Upload audio
      toast.loading('Uploading audio...', { id: 'transcription' });
      const { uploadUrl } = await uploadAudio({ audioData: base64 });

      // Start transcription
      toast.loading('Starting transcription...', { id: 'transcription' });
      const { transcriptId } = await startTranscription({ audioUrl: uploadUrl });

      // Poll for result
      toast.loading('Transcribing your audio...', { id: 'transcription' });
      const text = await pollForResult(transcriptId);

      toast.success('Transcription complete!', { id: 'transcription' });

      // Navigate to results page
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

      // Start timer
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

  const formatButtons: { id: FormatType; icon: React.ReactNode; label: string }[] = [
    { id: 'notes', icon: <FileText className="w-4 h-4" />, label: 'Notes' },
    { id: 'message', icon: <MessageSquare className="w-4 h-4" />, label: 'Message' },
    { id: 'twitter', icon: <XIcon className="w-4 h-4" />, label: 'X Post' },
    { id: 'linkedin', icon: <LinkedinIcon className="w-4 h-4" />, label: 'LinkedIn' },
    { id: 'email', icon: <Mail className="w-4 h-4" />, label: 'Email' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-500/30 font-sans tracking-tight">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 100 40" className="h-6 sm:h-8 w-auto text-white fill-none stroke-current stroke-[1.5]">
              <path d="M10 20 L25 20 L32 8 L45 32 L52 20 L80 20" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="hidden md:flex items-center gap-10 text-[#888] text-sm font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <button
            onClick={() => navigate('/record')}
            className="bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-yellow-400 transition-all"
          >
            Try Voxl Free
          </button>
        </div>
      </nav>

      {/* Hero / Recording Section */}
      <section className="relative pt-28 sm:pt-40 pb-16 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        {/* Background glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[1000px] h-[500px] sm:h-[1000px] blur-[100px] sm:blur-[160px] rounded-full pointer-events-none transition-colors duration-500 ${isRecording && !isPaused ? 'bg-red-600/10' : isPaused ? 'bg-orange-500/10' : 'bg-yellow-500/8'}`}></div>

        {/* Additional subtle glows */}
        <div className="absolute top-20 left-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] blur-[100px] rounded-full pointer-events-none bg-purple-500/5"></div>
        <div className="absolute bottom-20 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] blur-[100px] rounded-full pointer-events-none bg-blue-500/5"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Hero headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 tracking-tight leading-[1.1]">
              Turn your <span className="text-yellow-400">voice</span> into
              <br />ready-to-post content
            </h1>
            <p className="text-[#666] text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Record your thoughts, and let AI transform them into polished posts for X, LinkedIn, emails, and more.
            </p>
          </motion.div>

          {/* Format display - non-selectable */}
          <p className="text-[#444] text-xs sm:text-sm mb-4">
            We can help you create content for
          </p>
          <div className="flex justify-center items-center gap-0.5 sm:gap-1 mb-8 sm:mb-12 bg-[#111]/40 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl w-fit mx-auto border border-white/10 shadow-2xl overflow-x-auto max-w-full">
            {formatButtons.map(({ id, icon, label }) => (
              <div
                key={id}
                className="px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 flex-shrink-0 text-[#666]"
              >
                {icon}
                <span className="text-[10px] sm:text-xs font-medium hidden xs:inline">{label}</span>
              </div>
            ))}
          </div>

          {/* Status text */}
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#444] font-bold mb-6 sm:mb-8">
            {isPaused ? 'Recording paused' : isRecording ? 'Recording in progress...' : isProcessing ? 'Processing your audio...' : 'Tap the mic to start'}
          </p>

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
              /* When recording: show pause/resume and stop buttons */
              <div className="relative flex items-center gap-4 sm:gap-6">
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

            {/* Organic waveform visualization - hidden on mobile */}
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
          <p className={`font-medium tracking-wide text-xs sm:text-sm ${isPaused ? 'text-orange-400' : isRecording ? 'text-red-400' : 'text-[#888]'}`}>
            {isPaused ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Paused: {formatTime(recordingTime)}
              </span>
            ) : isRecording ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Recording: {formatTime(recordingTime)}
              </span>
            ) : isProcessing ? (
              'Processing your recording...'
            ) : (
              'Click the mic button to start recording'
            )}
          </p>

          <div className="mt-16 sm:mt-40 flex flex-col items-center px-4">
            <div className="bg-[#111]/30 backdrop-blur-sm p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/5 flex items-center gap-3 sm:gap-4 group cursor-pointer hover:border-white/10 transition-colors">
              <div className="w-4 h-4 sm:w-5 sm:h-5 relative flex-shrink-0">
                <div className="absolute inset-0 bg-[#333] rounded-full"></div>
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-[#888] relative z-10" />
              </div>
              <span className="text-xs sm:text-sm text-[#444] font-medium">Say anything to start transcription...</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section id="how-it-works" className="py-20 sm:py-40 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-24">
            <div className="inline-flex items-center gap-2 sm:gap-2.5 bg-yellow-500/5 border border-yellow-500/10 text-yellow-400 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-10">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              Voice to Results
            </div>
            <h2 className="text-3xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-8 leading-[1.1] tracking-tight">Voice to Content in <span className="relative inline-block text-yellow-400">3 Steps <div className="absolute bottom-1 sm:bottom-2 left-0 w-full h-1 sm:h-1.5 bg-yellow-500/20 -z-10 blur-md"></div></span></h2>
            <p className="text-[#666] text-base sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed px-4">Bring any of your thoughts or ideas to life by talking to our voice assistant.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-10">
            <FeatureCard
              icon={Layout}
              category="Step 01"
              title="Pick Your Format"
              description="Choose from a variety of outputs: post, email, video scripts, or meeting summaries."
            />
            <FeatureCard
              icon={Mic}
              category="Step 02"
              title="Start Talking"
              description="Talk naturally. Our AI handles the messy parts, pauses, and rephrasing instantly."
            />
            <FeatureCard
              icon={Copy}
              category="Step 03"
              title="Copy & Share"
              description="Your content is ready to publish. One click to copy or share to your favorite tools."
            />
          </div>
        </div>
      </section>

      {/* Built for People Section */}
      <section className="py-20 sm:py-40 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-24">
            <div className="inline-flex items-center gap-2 sm:gap-2.5 bg-yellow-500/5 border border-yellow-500/10 text-yellow-400 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-10">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              Who is it for?
            </div>
            <h2 className="text-3xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-8 leading-[1.1] tracking-tight px-2">Built for People Who <span className="text-yellow-400">Think Out Loud</span></h2>
            <p className="text-[#666] text-base sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed px-4">Whether you are a founder, content creator, or professional — Voxl is built for you.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-10">
            <AudienceCard
              icon={PenTool}
              badge="For Founders"
              title="Brain Dump → Strategic Doc"
              description="Capture your vision and turn it into professional roadmaps or strategy documents in seconds."
            />
            <AudienceCard
              icon={Send}
              badge="For Creators"
              title="Speech → Post"
              description="Turn your casual rants into viral LinkedIn or X posts without losing your personal voice."
            />
            <AudienceCard
              icon={Mail}
              badge="For Professionals"
              title="Quick Voice → Perfect Email"
              description="Reply to emails or draft complex responses while on the move, perfectly formatted every time."
            />
          </div>
        </div>
      </section>

      {/* Why Voxl features grid */}
      <section id="features" className="py-20 sm:py-40 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-24">
            <div className="inline-flex items-center gap-2 sm:gap-2.5 bg-yellow-500/5 border border-yellow-500/10 text-yellow-400 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-10">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              Features
            </div>
            <h2 className="text-4xl sm:text-7xl md:text-8xl font-bold mb-4 sm:mb-8 tracking-tighter">Why <span className="text-yellow-400 relative">Voxl? <div className="absolute -inset-4 bg-yellow-500/5 blur-3xl -z-10 rounded-full"></div></span></h2>
            <p className="text-[#666] text-base sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed px-4">Voxl is more than just a voice recorder. It is your AI content partner that understands context.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="sm:col-span-2 bg-[#0a0a0a] border border-white/5 p-6 sm:p-16 rounded-2xl sm:rounded-[3rem] flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-yellow-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-10">
                  <Plus className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-400" />
                </div>
                <h3 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-6">AT Your side</h3>
                <p className="text-[#666] text-sm sm:text-xl leading-relaxed max-w-lg font-medium">Voxl is available 24/7. No more lost ideas because you can't reach your keyboard in time. Ready when you are.</p>
              </div>
              <div className="mt-8 sm:mt-16 flex flex-wrap items-center gap-4 sm:gap-8 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#444] relative z-10">
                <span className="flex items-center gap-2 sm:gap-3"><div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-yellow-500 rounded-full"></div> iOS & Android</span>
                <span className="flex items-center gap-2 sm:gap-3"><div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-yellow-500 rounded-full"></div> Web App</span>
                <span className="flex items-center gap-2 sm:gap-3"><div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-yellow-500 rounded-full"></div> API Access</span>
              </div>
            </div>

            <FeatureCard
              icon={Zap}
              title="AI Assistant everyday"
              description="Trained on your specific style, Voxl gets better the more you use it."
            />
            <FeatureCard
              icon={LineChart}
              title="Insights & Trends"
              description="Identify patterns in your thoughts and get suggestions for your next big project."
            />
            <div className="sm:col-span-1 bg-[#0a0a0a] border border-white/5 p-6 sm:p-12 rounded-2xl sm:rounded-[2.5rem] flex flex-col items-center text-center justify-center group">
              <Globe className="w-8 h-8 sm:w-12 sm:h-12 text-[#333] mb-4 sm:mb-8 group-hover:text-yellow-400 transition-colors" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Enhance Presence</h3>
              <p className="text-[#666] font-medium text-sm sm:text-base">Speak in one language, publish in 50+.</p>
            </div>
            <FeatureCard
              icon={Layout}
              title="Identify Your Path"
              description="Our AI helps you structure your random thoughts into clear, actionable goals."
            />
            <div className="sm:col-span-2 lg:col-span-3 bg-[#0a0a0a] border border-white/5 p-5 sm:p-12 rounded-2xl sm:rounded-[3rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 group overflow-hidden relative">
              <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-10 relative z-10">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-green-500/5 rounded-full flex items-center justify-center border border-green-500/10 flex-shrink-0">
                  <Shield className="w-7 h-7 sm:w-10 sm:h-10 text-green-500/40" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Privacy Core</h3>
                  <p className="text-[#555] font-medium text-sm sm:text-lg">Your data is yours. We encrypt everything and never use your voice for model training.</p>
                </div>
              </div>
              <ArrowUpRight className="w-6 h-6 sm:w-10 sm:h-10 text-[#222] group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1 hidden sm:block" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-40 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-24">
            <div className="inline-flex items-center gap-2 sm:gap-2.5 bg-yellow-500/5 border border-yellow-500/10 text-yellow-400 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-10">
              <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              Help
            </div>
            <h2 className="text-3xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-8 tracking-tight px-2">Frequently Asked <span className="text-yellow-400">Questions</span></h2>
          </div>

          <div className="divide-y divide-white/5">
            <FAQItem
              question="What is Voxl and how does it work?"
              answer="Voxl is an AI-powered voice-to-content engine. You simply talk, and our AI refines your thoughts into structured formats like posts, emails, or docs."
            />
            <FAQItem
              question="How does voice to content conversion work?"
              answer="We use advanced LLMs and voice processing to understand context, tone, and specific instructions, ensuring the output matches your personal voice."
            />
            <FAQItem
              question="Is Voxl better than direct recording and transcribing?"
              answer="Yes. Traditional transcription just gives you text. Voxl gives you finished content, formatted and optimized for your target platform."
            />
            <FAQItem
              question="Can I generate content in different styles and tones?"
              answer="Absolutely. You can provide instructions like 'Make it professional' or 'Make it a funny tweet' and Voxl will adapt accordingly."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-40 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto bg-[#0a0a0a] p-8 sm:p-24 rounded-2xl sm:rounded-[4rem] border border-white/5 text-center relative overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-32 sm:w-64 h-32 sm:h-64 bg-yellow-500/10 blur-[60px] sm:blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -right-24 w-32 sm:w-64 h-32 sm:h-64 bg-yellow-500/10 blur-[60px] sm:blur-[100px] rounded-full"></div>

          <div className="relative z-10">
            <h2 className="text-4xl sm:text-7xl font-bold mb-4 sm:mb-10 tracking-tight">Ready to Voxl?</h2>
            <p className="text-[#666] text-base sm:text-2xl mb-8 sm:mb-16 max-w-xl mx-auto font-medium px-4">Try for free, no credit card required. Join 5,000+ people who think out loud.</p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center">
              <button
                onClick={() => navigate('/record')}
                className="w-full sm:w-auto bg-yellow-500 text-black px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-3xl text-base sm:text-xl font-bold hover:bg-yellow-400 transition-all hover:scale-105 flex items-center justify-center gap-3 sm:gap-4 shadow-[0_20px_50px_rgba(234,179,8,0.3)]"
              >
                <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                Start Recording
              </button>
              <a
                href="#features"
                className="flex items-center gap-2 sm:gap-3 text-[#555] hover:text-white transition-colors text-base sm:text-xl font-bold group/btn"
              >
                Learn More <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-16 sm:pt-40 pb-10 sm:pb-20 px-4 sm:px-8 border-t border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-16 mb-12 sm:mb-32">
            <div className="col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <VoxlLogo className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xl sm:text-2xl font-bold tracking-tighter">Voxl</span>
              </div>
              <p className="text-[#555] text-sm sm:text-lg leading-relaxed max-w-sm font-medium">
                Empowering the next generation of thinkers, creators and professionals to bring their ideas to life through voice.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 sm:mb-8 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#333]">Product</h4>
              <ul className="space-y-3 sm:space-y-5 text-[#555] font-medium text-sm sm:text-base">
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-yellow-400 transition-colors">How it Works</a></li>
                <li><a href="#faq" className="hover:text-yellow-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-10 pt-8 sm:pt-16 border-t border-white/5 text-[#333] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">
            <p>© 2026 Voxl Inc.</p>
            <div className="flex items-center gap-4 sm:gap-10">
              <span>Built with passion</span>
              <div className="w-1 h-1 bg-[#1a1a1a] rounded-full"></div>
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
