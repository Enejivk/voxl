import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Check, ArrowLeft, Zap, Mail, Loader2, FileText, RefreshCw, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { modelenceMutation, modelenceQuery, createQueryKey } from '@modelence/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type ToneType = 'storytelling' | 'emotional' | 'thought_leadership' | 'curiosity' | 'inspirational';

/* --- Icons --- */
const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24h-2.19L17.61 20.643z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.774-.773 1.774-1.73V1.729C24 .774 23.205 0 22.225 0z" />
  </svg>
);

/* --- X Post Preview Icons --- */
const VerifiedBadge = () => (
  <svg viewBox="0 0 22 22" className="w-[18px] h-[18px]" fill="none">
    <circle cx="11" cy="11" r="11" fill="#1D9BF0" />
    <path d="M9.5 14.25L6.75 11.5L7.8125 10.4375L9.5 12.125L14.1875 7.4375L15.25 8.5L9.5 14.25Z" fill="white" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const RetweetIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BarChartIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIconSmall = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

/* --- LinkedIn Icons --- */
const LikeIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const LinkedInCommentIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const RepostIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const SendIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/* --- LinkedIn Reaction Emojis --- */
const ReactionEmojis = () => (
  <div className="flex items-center -space-x-1">
    {/* Like (blue thumb) */}
    <div className="w-[20px] h-[20px] rounded-full bg-[#378fe9] flex items-center justify-center ring-2 ring-white z-30">
      <svg viewBox="0 0 16 16" className="w-[10px] h-[10px]" fill="white">
        <path d="M13.2 4.9h-3.1V2.6c0-1-0.8-1.8-1.8-1.8h-0.3c-0.2 0-0.4 0.2-0.5 0.4L5.5 6.7v7.6h6.1c0.7 0 1.3-0.5 1.5-1.1l1.4-4.7c0.3-1-0.4-1.6-1.3-1.6z M3.6 7H1.5v7.3h2.1V7z" />
      </svg>
    </div>
    {/* Celebrate (green clap) */}
    <div className="w-[20px] h-[20px] rounded-full bg-[#44b37f] flex items-center justify-center ring-2 ring-white z-20">
      <svg viewBox="0 0 16 16" className="w-[10px] h-[10px]" fill="white">
        <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.4 6.6L8 10l-3.4-3.4 1.1-1.1L8 7.8l2.3-2.3 1.1 1.1z" />
      </svg>
    </div>
    {/* Heart (red) */}
    <div className="w-[20px] h-[20px] rounded-full bg-[#e16745] flex items-center justify-center ring-2 ring-white z-10">
      <svg viewBox="0 0 16 16" className="w-[10px] h-[10px]" fill="white">
        <path d="M8 14s-5.5-3.8-5.5-7.2C2.5 4.6 4.1 3 6.2 3 7.2 3 8 3.6 8 3.6S8.8 3 9.8 3c2.1 0 3.7 1.6 3.7 3.8C13.5 10.2 8 14 8 14z" />
      </svg>
    </div>
  </div>
);

type Platform = 'notes' | 'x' | 'linkedin' | 'email';

/* --- Format text with hashtags highlighted --- */
const formatTextWithHashtags = (text: string) => {
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span key={index} className="text-[#1d9bf0] font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
};

/* --- X Post Preview Card --- */
const XPostCard = ({ content }: { content: string }) => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateString = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="bg-[#1c2732] rounded-2xl overflow-hidden shadow-xl w-full max-w-[750px]">
      {/* Header */}
      <div className="px-5 pt-4 pb-0 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-[#2f3336]">
            <XIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[15px] leading-5 text-[#e7e9ea]">Your Name</span>
              <VerifiedBadge />
            </div>
            <span className="text-[13px] leading-4 text-[#71767b]">@yourhandle</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border border-[#1d9bf0] text-[#1d9bf0]">
          Follow <XIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pt-4 pb-3">
        <p className="text-[17px] leading-[1.45] font-normal text-[#e7e9ea]">
          {formatTextWithHashtags(content)}
        </p>
        <p className="text-[13px] mt-3 text-[#71767b]">{timeString} · {dateString}</p>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-[#2f3336]" />

      {/* Stats Row */}
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-[#71767b]">
            <CommentIcon />
            <span className="text-[13px] font-medium">0</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#71767b]">
            <RetweetIcon />
            <span className="text-[13px] font-medium">0</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#f91880]">
            <HeartIcon filled />
            <span className="text-[13px] font-medium">0</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#71767b]">
            <BarChartIcon />
            <span className="text-[13px] font-medium">0</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#71767b]">
          <BookmarkIcon />
          <ShareIconSmall />
        </div>
      </div>
    </div>
  );
};

/* --- LinkedIn Post Preview Card --- */
const LinkedInPostCard = ({ content }: { content: string }) => {
  const linkedInActions = [
    { icon: LikeIcon, label: 'Like' },
    { icon: LinkedInCommentIcon, label: 'Comment' },
    { icon: RepostIcon, label: 'Repost' },
    { icon: SendIcon, label: 'Send' },
  ];

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full max-w-[750px] border border-[#e0e0e0]/50">
      {/* Header */}
      <div className="px-4 pt-4 pb-0 flex items-start justify-between">
        <div className="flex items-start gap-2.5">
          {/* Avatar - gradient placeholder */}
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-yellow-500 via-orange-400 to-red-500 flex items-center justify-center">
            <span className="text-white text-lg font-bold">U</span>
          </div>
          {/* Name + Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[15px] text-[#191919] leading-5">Your Name</span>
              <span className="text-[13px] text-[#666] leading-5">· 2nd</span>
            </div>
            <span className="text-[13px] text-[#666] leading-4">Your headline here</span>
          </div>
        </div>
        {/* Follow button */}
        <button className="flex items-center gap-1.5 px-4 py-1 rounded-full text-[15px] font-semibold border-2 border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/5 transition-colors">
          <span className="text-lg leading-none">+</span> Follow
        </button>
      </div>

      {/* Body text */}
      <div className="px-4 pt-3 pb-3">
        <p className="text-[15px] leading-[1.4] text-[#191919] whitespace-pre-wrap">
          {content}
        </p>
      </div>

      {/* Reactions + Comments count */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ReactionEmojis />
          <span className="text-[13px] text-[#666] ml-1">0</span>
        </div>
        <div className="flex items-center gap-1 text-[13px] text-[#666]">
          <span>0 comments</span>
          <span>·</span>
          <span>0 reposts</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-[#e0e0e0]" />

      {/* Action bar */}
      <div className="px-2 py-1 flex items-center justify-between">
        {linkedInActions.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex-1 flex flex-col items-center gap-0.5 py-3 rounded-lg text-[#666] hover:bg-[#f3f4f6] transition-colors group"
          >
            <Icon className="w-5 h-5 group-hover:text-[#191919] transition-colors" />
            <span className="text-xs font-semibold group-hover:text-[#191919] transition-colors">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* --- Email Preview Card --- */
const EmailPreviewCard = ({ content }: { content: string }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-xl w-full max-w-[750px] border border-gray-200">
      {/* Email Header */}
      <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-yellow-500">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">From: you@email.com</p>
            <p className="text-gray-500 text-xs">To: recipient@email.com</p>
          </div>
        </div>
        <p className="text-gray-700 font-medium">Subject: Your message</p>
      </div>

      {/* Email Body */}
      <div className="px-5 py-5">
        <p className="text-[15px] leading-[1.7] text-gray-700 whitespace-pre-wrap">
          {content}
        </p>
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-gray-600 text-sm">Best regards,</p>
          <p className="text-gray-900 font-medium text-sm">Your Name</p>
        </div>
      </div>
    </div>
  );
};

type UsageData = {
  used: number;
  limit: number;
  remaining: number;
};

export default function TranscriptionResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('notes');

  // Get usage data
  const { data: usageData } = useQuery({
    ...modelenceQuery<UsageData>('content.getUsage'),
  });
  const [formattedContent, setFormattedContent] = useState<Record<Platform, string | null>>(() => {
    // Initialize notes from localStorage so content displays on refresh
    const savedNotes = localStorage.getItem('voxl_notes');
    return {
      notes: savedNotes || null,
      x: null,
      linkedin: null,
      email: null,
    };
  });
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const [isLengthDropdownOpen, setIsLengthDropdownOpen] = useState(false);
  const toneDropdownRef = useRef<HTMLDivElement>(null);
  const lengthDropdownRef = useRef<HTMLDivElement>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [usedTone, setUsedTone] = useState<Record<Platform, ToneType | null>>({
    notes: null,
    x: null,
    linkedin: null,
    email: null,
  });

  const { text: originalText, isNewRecording } = (location.state as { text: string; isNewRecording?: boolean }) || { text: '' };

  // Use localStorage to persist notes across refresh
  // Only use originalText if it's a NEW recording (isNewRecording flag set)
  const [editedNotes, setEditedNotes] = useState(() => {
    // If this is a new recording, use originalText and save it
    if (isNewRecording && originalText) {
      localStorage.setItem('voxl_notes', originalText);
      return originalText;
    }
    // Otherwise, always use localStorage (user's edits)
    const saved = localStorage.getItem('voxl_notes');
    return saved || originalText || '';
  });

  // Save to localStorage whenever notes change
  useEffect(() => {
    if (editedNotes) {
      localStorage.setItem('voxl_notes', editedNotes);
    }
  }, [editedNotes]);

  // Clear the isNewRecording flag from history state after processing
  // This prevents it from overwriting on refresh
  useEffect(() => {
    if (isNewRecording) {
      window.history.replaceState(
        { ...location.state, isNewRecording: false },
        ''
      );
    }
  }, [isNewRecording, location.state]);

  const { mutate: formatForX, isPending: isFormattingX } = useMutation({
    ...modelenceMutation<{ formattedText: string }>('content.formatForX'),
    onSuccess: (data) => {
      setFormattedContent(prev => ({ ...prev, x: data.formattedText }));
      queryClient.invalidateQueries({ queryKey: createQueryKey('content.getUsage') });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to format for X');
    },
  });

  const { mutate: formatForLinkedIn, isPending: isFormattingLinkedIn } = useMutation({
    ...modelenceMutation<{ formattedText: string }>('content.formatForLinkedIn'),
    onSuccess: (data) => {
      setFormattedContent(prev => ({ ...prev, linkedin: data.formattedText }));
      queryClient.invalidateQueries({ queryKey: createQueryKey('content.getUsage') });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to format for LinkedIn');
    },
  });

  const { mutate: regenerateWithTone, isPending: isRegenerating } = useMutation({
    ...modelenceMutation<{ formattedText: string }>('content.regenerateWithTone'),
    onSuccess: (data) => {
      setFormattedContent(prev => ({ ...prev, [selectedPlatform]: data.formattedText }));
      queryClient.invalidateQueries({ queryKey: createQueryKey('content.getUsage') });
      toast.success('Content regenerated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to regenerate content');
    },
  });

  const { mutate: adjustLength, isPending: isAdjustingLength } = useMutation({
    ...modelenceMutation<{ formattedText: string }>('content.adjustLength'),
    onSuccess: (data) => {
      setFormattedContent(prev => ({ ...prev, [selectedPlatform]: data.formattedText }));
      setIsLengthDropdownOpen(false);
      queryClient.invalidateQueries({ queryKey: createQueryKey('content.getUsage') });
      toast.success('Length adjusted!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to adjust length');
    },
  });

  const handleRegenerateTone = (tone: ToneType) => {
    if (selectedPlatform === 'notes') return;
    setIsToneDropdownOpen(false);
    setUsedTone(prev => ({ ...prev, [selectedPlatform]: tone }));
    regenerateWithTone({
      text: editedNotes,
      platform: selectedPlatform,
      tone,
    });
  };

  const handleAdjustLength = (action: 'increase' | 'decrease') => {
    if (selectedPlatform === 'notes' || !currentContent) return;
    setIsLengthDropdownOpen(false);
    adjustLength({
      text: currentContent,
      platform: selectedPlatform,
      action,
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toneDropdownRef.current && !toneDropdownRef.current.contains(event.target as Node)) {
        setIsToneDropdownOpen(false);
      }
      if (lengthDropdownRef.current && !lengthDropdownRef.current.contains(event.target as Node)) {
        setIsLengthDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toneLabels: Record<ToneType, string> = {
    storytelling: 'Storytelling',
    emotional: 'Emotional',
    thought_leadership: 'Thought Leadership',
    curiosity: 'Curiosity Hook',
    inspirational: 'Inspirational',
  };

  // Set notes content when page loads (only for NEW recordings)
  useEffect(() => {
    if (isNewRecording && originalText && !formattedContent.notes) {
      setFormattedContent(prev => ({ ...prev, notes: originalText }));
    }
  }, [isNewRecording, originalText, formattedContent.notes]);

  const handlePlatformChange = (platform: Platform) => {
    setSelectedPlatform(platform);

    // Save edited notes to localStorage before generating content for other platforms
    if (platform !== 'notes' && editedNotes) {
      localStorage.setItem('voxl_notes', editedNotes);
    }

    // Format content if not already formatted
    if (!formattedContent[platform]) {
      if (platform === 'notes') {
        setFormattedContent(prev => ({ ...prev, notes: editedNotes }));
      } else if (platform === 'x') {
        formatForX({ text: editedNotes });
      } else if (platform === 'linkedin') {
        formatForLinkedIn({ text: editedNotes });
      } else if (platform === 'email') {
        // For now, use original text for Email (will add AI formatting later)
        setFormattedContent(prev => ({ ...prev, email: editedNotes }));
      }
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = notesTextareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 500)}px`;
    }
  }, [editedNotes, selectedPlatform]);

  
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleNewRecording = () => {
    navigate('/record');
  };

  const isLoading = (selectedPlatform === 'x' && isFormattingX) || (selectedPlatform === 'linkedin' && isFormattingLinkedIn) || isRegenerating || isAdjustingLength;
  const currentContent = formattedContent[selectedPlatform];

  // Show "no transcription" only if we have no content at all (not from location.state OR localStorage)
  if (!originalText && !editedNotes) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#666] mb-4">No transcription found</p>
          <button
            onClick={handleNewRecording}
            className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-medium hover:bg-yellow-400 transition-colors"
          >
            Start Recording
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex justify-between items-center">
          <button
            onClick={handleNewRecording}
            className="flex items-center gap-1.5 sm:gap-2 text-[#888] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">New Recording</span>
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Global Usage Counter */}
            {usageData && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${(usageData.used / usageData.limit) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#666]">
                  {usageData.used}/{usageData.limit} used
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2 bg-green-500/10 text-green-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              <Check className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 sm:pt-28 pb-10 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Platform Switcher */}
          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">Your Content</h2>
            <div className="flex justify-center flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => handlePlatformChange('notes')}
                className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium transition-all min-w-[90px] sm:min-w-[110px] ${
                  selectedPlatform === 'notes'
                    ? 'bg-gray-700 text-white shadow-lg'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Notes</span>
              </button>

              <button
                onClick={() => handlePlatformChange('x')}
                className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium transition-all min-w-[90px] sm:min-w-[110px] ${
                  selectedPlatform === 'x'
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <XIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">X</span>
              </button>

              <button
                onClick={() => handlePlatformChange('linkedin')}
                className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium transition-all min-w-[90px] sm:min-w-[110px] ${
                  selectedPlatform === 'linkedin'
                    ? 'bg-[#0a66c2] text-white shadow-lg'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <LinkedinIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">LinkedIn</span>
              </button>

              <button
                onClick={() => handlePlatformChange('email')}
                className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium transition-all min-w-[90px] sm:min-w-[110px] ${
                  selectedPlatform === 'email'
                    ? 'bg-yellow-500 text-black shadow-lg'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Email</span>
              </button>
            </div>
          </section>

          {/* Platform Preview */}
          <section>
            <div className="text-center mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">
                {selectedPlatform === 'notes' && 'Original Notes'}
                {selectedPlatform === 'x' && 'X Post Preview'}
                {selectedPlatform === 'linkedin' && 'LinkedIn Post Preview'}
                {selectedPlatform === 'email' && 'Email Preview'}
              </h2>
              {selectedPlatform === 'x' && currentContent && (
                <span className={`text-sm ${currentContent.length > 280 ? 'text-red-500' : 'text-[#555]'}`}>
                  {currentContent.length}/280 characters
                </span>
              )}
              {selectedPlatform === 'notes' && editedNotes && (
                <span className="text-sm text-[#555]">
                  {editedNotes.length} characters · {editedNotes.split(/\s+/).filter(Boolean).length} words
                </span>
              )}
              {usedTone[selectedPlatform] && (
                <div className="mt-2">
                  <span className="text-xs bg-yellow-500/15 text-yellow-400 px-2.5 py-1 rounded-full">
                    {toneLabels[usedTone[selectedPlatform]!]} tone
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mb-4" />
                  <p className="text-[#666] text-sm">Formatting for {selectedPlatform === 'x' ? 'X' : selectedPlatform}...</p>
                </div>
              ) : currentContent ? (
                <motion.div
                  key={selectedPlatform}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex justify-center"
                >
                  {selectedPlatform === 'notes' && (
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-[750px]">
                      <textarea
                        ref={notesTextareaRef}
                        value={editedNotes}
                        onChange={(e) => {
                          const newText = e.target.value;
                          setEditedNotes(newText);
                          // Save directly to localStorage on every change
                          localStorage.setItem('voxl_notes', newText);
                          setFormattedContent(prev => ({
                            ...prev,
                            notes: newText,
                            x: null,
                            linkedin: null,
                            email: null,
                          }));
                          setUsedTone({
                            notes: null,
                            x: null,
                            linkedin: null,
                            email: null,
                          });
                        }}
                        className="w-full bg-transparent text-[#ccc] text-base leading-relaxed outline-none min-h-[200px] max-h-[500px] overflow-y-auto resize-none placeholder-[#555]"
                        placeholder="Your notes will appear here..."
                      />
                      <p className="text-xs text-[#555] mt-3 pt-3 border-t border-white/5">
                        Edit your notes here. Changes will be used when formatting for other platforms.
                      </p>
                    </div>
                  )}
                  {selectedPlatform === 'x' && <XPostCard content={currentContent} />}
                  {selectedPlatform === 'linkedin' && <LinkedInPostCard content={currentContent} />}
                  {selectedPlatform === 'email' && <EmailPreviewCard content={currentContent} />}
                </motion.div>
              ) : null}

              {/* Actions */}
              {currentContent && !isLoading && (
                <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-lg">
                  <button
                    onClick={() => handleCopy(currentContent)}
                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-5 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors flex-1"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy
                  </button>

                  {selectedPlatform !== 'notes' && (
                    <>
                      {/* Regenerate Dropdown */}
                      <div className="relative flex-1" ref={toneDropdownRef}>
                        <button
                          onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
                          className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Regenerate
                          <ChevronDown className={`w-4 h-4 transition-transform ${isToneDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isToneDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute bottom-full left-0 right-0 mb-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 min-w-[180px]"
                            >
                              <button
                                onClick={() => handleRegenerateTone('storytelling')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-white"
                              >
                                <span>Storytelling</span>
                              </button>
                              <button
                                onClick={() => handleRegenerateTone('emotional')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-white border-t border-white/5"
                              >
                                <span>Emotional</span>
                              </button>
                              <button
                                onClick={() => handleRegenerateTone('thought_leadership')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-white border-t border-white/5"
                              >
                                <span>Thought Leadership</span>
                              </button>
                              <button
                                onClick={() => handleRegenerateTone('curiosity')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-white border-t border-white/5"
                              >
                                <span>Curiosity Hook</span>
                              </button>
                              <button
                                onClick={() => handleRegenerateTone('inspirational')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-white border-t border-white/5"
                              >
                                <span>Inspirational</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Length Dropdown */}
                      <div className="relative flex-1" ref={lengthDropdownRef}>
                        <button
                          onClick={() => setIsLengthDropdownOpen(!isLengthDropdownOpen)}
                          className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-5 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors"
                        >
                          Length
                          <ChevronDown className={`w-4 h-4 transition-transform ${isLengthDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isLengthDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute bottom-full left-0 right-0 mb-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
                            >
                              <button
                                onClick={() => handleAdjustLength('increase')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-white"
                              >
                                <ArrowUp className="w-4 h-4 text-green-400" />
                                <span>Make Longer</span>
                              </button>
                              <button
                                onClick={() => handleAdjustLength('decrease')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-white border-t border-white/5"
                              >
                                <ArrowDown className="w-4 h-4 text-orange-400" />
                                <span>Make Shorter</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Record Again */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleNewRecording}
              className="flex items-center gap-2 text-[#666] hover:text-white transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Record Again</span>
            </button>
          </div>
        </div>
      </div>

      </div>
  );
}
