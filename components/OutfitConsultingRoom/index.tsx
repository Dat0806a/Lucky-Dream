import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CameraScanner } from './CameraScanner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Mic, MicOff, Zap, Award, Sparkles, Volume2, VolumeX, 
  CheckCircle2, RefreshCw, X, AlertCircle, HelpCircle, ArrowLeft, Send
} from 'lucide-react';
import { analyzeOutfitFromCamera, chatWithAI } from '../../services/geminiService';
import { OutfitAnalysis } from '../../types';

export const OutfitConsultingRoom: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Main states
  const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);
  
  // Dynamic theme listener
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Dynamic theme variables based on isDark
  const theme = {
    bg: isDark ? 'bg-slate-900 text-slate-100' : 'bg-[#fffcf7] text-slate-900',
    header: isDark ? 'border-b border-slate-800 bg-slate-950/80 text-slate-100' : 'border-b-2 border-brand-gold bg-brand-red text-white shadow-lg',
    headerTitle: isDark ? 'bg-gradient-to-r from-white via-slate-150 to-brand-gold bg-clip-text text-transparent' : 'text-brand-gold font-black',
    headerSub: isDark ? 'text-slate-400 font-mono' : 'text-brand-goldLight/70 font-mono',
    backBtn: isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-brand-red border border-brand-gold/50 text-brand-goldLight font-semibold hover:bg-red-850 hover:text-white shadow-md',
    statusBadge: isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-brand-red/90 border border-brand-gold/30 text-brand-goldLight shadow-sm',
    
    cardBg: isDark ? 'bg-slate-950 border-slate-800 shadow-2xl' : 'bg-white border-brand-gold/25 shadow-[0_10px_35px_rgba(212,175,55,0.06)]',
    cardIndicator: isDark ? 'bg-red-500' : 'bg-gradient-to-r from-brand-red to-brand-gold',
    cardTitle: isDark ? 'text-slate-300' : 'text-brand-red font-bold',
    cardSubTitle: isDark ? 'text-slate-400' : 'text-brand-red/60 font-medium',
    
    border: isDark ? 'border-slate-800' : 'border-brand-gold/20',
    subBorder: isDark ? 'border-slate-800/60' : 'border-brand-gold/15',
    
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    textMain: isDark ? 'text-slate-200' : 'text-slate-800',
    textBold: isDark ? 'text-slate-150' : 'text-brand-red font-bold',
    accentText: isDark ? 'text-brand-gold' : 'text-brand-red font-extrabold',
    accentBg: isDark ? 'bg-brand-gold/10' : 'bg-brand-gold/10',
    
    labelColor: isDark ? 'text-slate-200' : 'text-slate-800 font-semibold',
    labelDesc: isDark ? 'text-slate-400' : 'text-slate-500',
    
    inputBg: isDark ? 'bg-slate-900 border-slate-800/80 text-slate-100 hover:border-slate-700 focus:ring-brand-gold focus:border-brand-gold' : 'bg-amber-50/10 border-brand-gold/25 text-slate-900 hover:border-brand-gold/50 focus:ring-brand-red focus:border-brand-red',
    inputSuf: isDark ? 'text-slate-400' : 'text-brand-red/60',
    
    btnAction: isDark 
      ? 'bg-gradient-to-r from-brand-gold to-yellow-600 hover:from-yellow-500 hover:to-brand-gold text-slate-950 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.35)]' 
      : 'bg-gradient-to-r from-brand-red via-brand-redBright to-brand-gold hover:from-red-600 hover:to-amber-500 text-white shadow-[0_4px_20px_rgba(153,27,27,0.2)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.35)] border border-brand-gold/40',
      
    btnCam: isDark ? 'bg-brand-red text-white' : 'bg-brand-red text-white hover:bg-red-700',
    
    soundwaveBg: isDark ? 'bg-slate-900 border-slate-800/60' : 'bg-amber-50/15 border-brand-gold/15',
    soundwaveIndicator: (status: string) => {
      if (status === 'Listening') return isDark ? 'text-blue-400 animate-pulse' : 'text-blue-600 animate-pulse';
      if (status === 'Thinking') return isDark ? 'text-amber-400 animate-pulse' : 'text-amber-600 animate-pulse';
      if (status === 'Speaking') return isDark ? 'text-pink-400 animate-pulse' : 'text-brand-red animate-pulse';
      if (status === 'Ready') return isDark ? 'text-emerald-400' : 'text-emerald-600';
      return isDark ? 'text-slate-500' : 'text-slate-400';
    },
    scWave: (status: string) => {
      if (status === 'Listening') return 'bg-gradient-to-t from-blue-500 to-cyan-400';
      if (status === 'Thinking') return 'bg-gradient-to-t from-amber-500 to-yellow-400';
      if (status === 'Speaking') return isDark ? 'bg-gradient-to-t from-brand-gold to-rose-400' : 'bg-gradient-to-t from-brand-red to-brand-gold';
      return isDark ? 'bg-slate-750' : 'bg-amber-100';
    },
    scWaveMicBtn: (status: string) => {
      if (status === 'Listening') {
         return 'bg-gradient-to-r from-red-500 to-rose-500 border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]';
      }
      return isDark 
         ? 'bg-gradient-to-r from-brand-gold to-yellow-500 border-yellow-400 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
         : 'bg-gradient-to-r from-brand-red via-brand-redBright to-brand-gold border-brand-goldLight text-white hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]';
    },
    
    chatBox: isDark ? 'bg-slate-950 border-slate-800/85' : 'bg-amber-50/10 border-brand-gold/20',
    chatBoxTitle: isDark ? 'text-brand-gold border-slate-905' : 'text-brand-red border-brand-gold/15',
    chatUserBubble: isDark ? 'bg-brand-gold/10 text-slate-205 border border-brand-gold/20 mr-1 rounded-tr-none' : 'bg-brand-gold/15 text-brand-red border border-brand-gold/30 mr-1 rounded-tr-none shadow-sm font-semibold',
    chatAIBubble: isDark ? 'bg-slate-900 text-slate-300 border border-slate-805 ml-1 rounded-tl-none' : 'bg-white text-slate-850 border border-brand-gold/20 ml-1 rounded-tl-none shadow-sm',
    chatSenderLabel: isDark ? 'text-slate-550' : 'text-slate-400',
    
    bulletIcon: isDark ? 'text-emerald-500' : 'text-brand-gold shadow-sm',
    hashtagTag: isDark ? 'text-brand-gold bg-brand-gold/5 border-brand-gold/10' : 'text-brand-red bg-brand-red/5 border-brand-red/20',
    scoreRing: (scVal: number) => {
      if (scVal >= 90) return isDark ? 'text-amber-500 border-amber-500 bg-amber-500/10' : 'text-amber-600 border-brand-gold bg-brand-gold/10';
      if (scVal >= 80) return isDark ? 'text-brand-gold border-brand-gold bg-brand-gold/10' : 'text-brand-red border-brand-gold bg-brand-gold/5';
      return isDark ? 'text-slate-400 border-slate-500 bg-slate-500/10' : 'text-slate-650 border-slate-300 bg-slate-55';
    }
  };
  const [isScanning, setIsScanning] = useState(false);
  const [captureTrigger, setCaptureTrigger] = useState(0);
  const [cameraActive, setCameraActive] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Status indicators states
  const [cameraStatus, setCameraStatus] = useState('Connecting...');
  const [aiConnected, setAiConnected] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState('Off'); // Off, Ready, Listening, Thinking, Speaking

  // Auto scan configuration
  const [autoScan, setAutoScan] = useState(false);
  const [autoScanInterval, setAutoScanInterval] = useState(30000); // Default 30s (30,000ms)
  const [customSeconds, setCustomSeconds] = useState('30');
  const [countDown, setCountDown] = useState(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoScanTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Voice chat states
  const [voiceHistory, setVoiceHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Xin chào! Hãy bật camera và quét outfit của bạn. Tôi sẽ bắt đầu chấm điểm và tư vấn ngay tức thì.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const voiceTranscriptRef = useRef<string>('');
  const [isMuted, setIsMuted] = useState(false);
  
  // Web Speech API refs
  const recognitionRef = useRef<any>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  
  // Realtime Audio Wave Simulation state
  const [waveHeightMultiplier, setWaveHeightMultiplier] = useState(1);
  const animationRef = useRef<number | null>(null);

  // High-fidelity natural audio stream refs
  const audioQueueRef = useRef<HTMLAudioElement[]>([]);
  const currentAudioIndexRef = useRef<number>(-1);
  const isPlayingRef = useRef<boolean>(false);
  const audioPoolRef = useRef<HTMLAudioElement[]>([]);
  const isUnlockedRef = useRef<boolean>(false);

  // Refs to prevent state capture in event listeners and callbacks
  const analysisRef = useRef<OutfitAnalysis | null>(null);
  const voiceHistoryRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const handleVoiceSubmitRef = useRef<(text: string) => Promise<void>>(undefined);
  const userInputRef = useRef<string>('');
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingVoiceRef = useRef<boolean>(false);
  const hasSubmittedThisTurnRef = useRef<boolean>(false);
  const pendingScanSpeechRef = useRef<string | null>(null);
  const isMutedRef = useRef<boolean>(false);

  // Sync state values with refs on changes
  useEffect(() => {
    userInputRef.current = userInput;
  }, [userInput]);
  useEffect(() => {
    analysisRef.current = analysis;
  }, [analysis]);

  useEffect(() => {
    voiceHistoryRef.current = voiceHistory;
    // Auto-scroll the live chat window to the absolute bottom smoothly
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [voiceHistory]);

  // Trigger manual scanning
  const triggerManualScan = () => {
    if (isScanning) return;
    setErrorText(null);
    setCaptureTrigger(prev => prev + 1);
  };

  // Count down loop for Auto scan
  useEffect(() => {
    if (autoScan && !isScanning) {
      setCountDown(autoScanInterval / 1000);
      
      const cdTimer = setInterval(() => {
        setCountDown(prev => {
          if (prev <= 1) {
            triggerManualScan();
            return autoScanInterval / 1000;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(cdTimer);
    } else {
      setCountDown(0);
    }
  }, [autoScan, autoScanInterval, isScanning]);

  // Setup client Speech Recognition (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const rec = new SpeechRecognition();
      
      // Use continuous mode so it doesn't shut down on minor hesitations
      rec.continuous = true;
      // Fetch interim results for instant visual feedback and auto-corrections as the user speaks in Vietnamese
      rec.interimResults = true;
      rec.lang = 'vi-VN';
      rec.maxAlternatives = 1;

      // Helper to submit voice turn exactly once
      const triggerSubmission = () => {
        const textToSubmit = voiceTranscriptRef.current.trim();
        if (textToSubmit && !hasSubmittedThisTurnRef.current) {
          hasSubmittedThisTurnRef.current = true;
          isSubmittingVoiceRef.current = true;
          handleVoiceSubmitRef.current?.(textToSubmit);
        }
      };

      rec.onstart = () => {
        setVoiceStatus('Listening');
        isSubmittingVoiceRef.current = false;
        hasSubmittedThisTurnRef.current = false;
        setVoiceTranscript(''); // Reset transcription text for the current vocal turn
        voiceTranscriptRef.current = '';
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        setVoiceStatus('Ready');
      };

      rec.onend = () => {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        
        // On stop, if there is accumulated text which hasn't been sent yet, submit it immediately!
        triggerSubmission();
        setVoiceStatus('Ready');
      };

      rec.onresult = (event: any) => {
        // Suppress timer if already submitting
        if (isSubmittingVoiceRef.current || hasSubmittedThisTurnRef.current) return;

        // Clear existing silence timer because user is still active
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Reconstruct full text by traversing all segments (final + interim)
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        const fullText = (finalTranscript + interimTranscript).trim();

        if (fullText) {
          setVoiceTranscript(fullText);
          voiceTranscriptRef.current = fullText;

          // Snappy 1.25s silence detector for conversational Vietnamese turn-taking (Google defaults to 3-4s which is too slow)
          silenceTimeoutRef.current = setTimeout(() => {
            if (!hasSubmittedThisTurnRef.current) {
              console.log('Voice pause detected, auto-submitting:', fullText);
              triggerSubmission();
              rec.stop(); // Stop mic cleanly, which triggers onend and processes voice submission
            }
          }, 1250);
        }
      };

      recognitionRef.current = rec;
      setVoiceStatus('Ready');
    } else {
      setIsSpeechSupported(false);
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Warm up and initialize a pool of persistent, reusable HTMLAudioElement nodes for continuous safari voice streams
  useEffect(() => {
    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < 20; i++) {
      const audio = new Audio();
      audio.preload = "auto";
      // Silent raw wav stream base64 to fulfill safari autoplay gesture tracking
      audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      pool.push(audio);
    }
    audioPoolRef.current = pool;
    return () => {
      pool.forEach(audio => {
        try {
          audio.pause();
          audio.src = "";
          audio.onended = null;
          audio.onerror = null;
        } catch (e) {}
      });
    };
  }, []);

  // Unlock the entire HTMLAudioElement pool via any valid user action flow (clicks, mic toggle)
  const unlockAudioPool = useCallback(() => {
    if (isUnlockedRef.current) return;
    console.log("Unlocking audio pool for Safari/iOS compatibility...");
    audioPoolRef.current.forEach(audio => {
      if (audio) {
        audio.play()
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
          })
          .catch(err => {
            console.log("Audio node warm up hint:", err);
          });
      }
    });
    isUnlockedRef.current = true;
  }, []);

  // Force pre-triggering and pre-caching of browser voice lists
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const precacheVoices = () => {
        window.speechSynthesis.getVoices();
      };
      precacheVoices();
      window.speechSynthesis.onvoiceschanged = precacheVoices;
    }
  }, []);

  // Stop all running audio streams cleanly and reset status
  const stopAllAudio = useCallback(() => {
    // 1. Cancel default browser speech synthesis fallback
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // 2. Pause and clear HTML5 audio pool items
    audioPoolRef.current.forEach(audio => {
      try {
        if (!audio.paused) {
          audio.pause();
        }
        audio.currentTime = 0;
        audio.onended = null;
        audio.onerror = null;
      } catch (err) {
        console.warn('Error clearing audio element:', err);
      }
    });
    audioQueueRef.current = [];
    currentAudioIndexRef.current = -1;
    isPlayingRef.current = false;
    setVoiceStatus('Ready');
  }, []);

  // Cleanup all audio threads on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  // Sync isMuted state to ref and dynamically mute/unmute active audios without stopping playback
  useEffect(() => {
    isMutedRef.current = isMuted;
    audioPoolRef.current.forEach(audio => {
      if (audio) {
        audio.muted = isMuted;
      }
    });
  }, [isMuted]);

  // Helper to split text into larger spoken paragraphs (up to 500 characters) to ensure natural flow and continuous audio delivery
  const splitTextIntoSegments = (valText: string): string[] => {
    const cleanText = valText.replace(/[\r\n]+/g, ' ').trim();
    if (cleanText.length <= 500) {
      return [cleanText];
    }

    // Split on typical paragraph/sentence pause points safely to keep continuity, up to 500 chars limit per chunk
    const sentences = cleanText.split(/([.!?;\u3002\uff01\uff1f]+)/g);
    const segments: string[] = [];
    let currentSegment = "";

    for (let i = 0; i < sentences.length; i++) {
      const part = sentences[i];
      if (!part) continue;

      if (part.match(/^[.!?;\u3002\uff01\uff1f]+$/)) {
        currentSegment += part;
      } else {
        if (currentSegment) {
          if (currentSegment.length + part.length > 500) {
            segments.push(currentSegment.trim());
            currentSegment = part;
          } else {
            currentSegment += " " + part;
          }
        } else {
          currentSegment = part;
        }
      }
    }
    if (currentSegment) {
      segments.push(currentSegment.trim());
    }

    return segments.filter(s => s.trim().length > 0);
  };

  // Speak AI responses aloud using beautiful, fluent online Vietnamese TTS
  const playAudio = useCallback((text: string) => {
    stopAllAudio();
    setVoiceStatus('Thinking');

    const segments = splitTextIntoSegments(text);
    if (segments.length === 0) {
      setVoiceStatus('Ready');
      return;
    }

    // Map segments to the preloaded audios in the warmed pool
    const preloadedAudios: (HTMLAudioElement | null)[] = new Array(segments.length).fill(null);

    // Concurrent pre-fetcher using our safari-unlocked audioPool
    const prefetch = (idx: number) => {
      if (idx < 0 || idx >= segments.length || preloadedAudios[idx]) return;
      
      const poolIdx = idx % audioPoolRef.current.length;
      const audio = audioPoolRef.current[poolIdx];
      if (!audio) return;

      const encodedText = encodeURIComponent(segments[idx]);
      const url = `/api/tts?text=${encodedText}`;
      
      audio.src = url;
      audio.preload = "auto";
      audio.muted = isMutedRef.current;
      preloadedAudios[idx] = audio;
    };

    // Trigger proactive caching for the first two audio items immediately
    prefetch(0);
    prefetch(1);

    // Launch sequential queue playback with proactive look-ahead pre-fetching
    const playSequentially = (index: number) => {
      if (index >= segments.length) {
        setVoiceStatus('Ready');
        isPlayingRef.current = false;

        // Play pending scan message if present
        if (pendingScanSpeechRef.current) {
          const nextText = pendingScanSpeechRef.current;
          pendingScanSpeechRef.current = null;
          // Play the pending scan message after a brief natural pause
          setTimeout(() => {
            playAudio(nextText);
          }, 800);
        }
        return;
      }

      // Proactively prefetch following chunks ahead of playing
      prefetch(index + 1);
      prefetch(index + 2);

      setVoiceStatus('Speaking');
      isPlayingRef.current = true;

      let audio = preloadedAudios[index];
      if (!audio) {
        const poolIdx = index % audioPoolRef.current.length;
        audio = audioPoolRef.current[poolIdx];
        if (audio) {
          const encodedText = encodeURIComponent(segments[index]);
          const url = `/api/tts?text=${encodedText}`;
          audio.src = url;
          audio.preload = "auto";
          audio.muted = isMutedRef.current;
          preloadedAudios[index] = audio;
        }
      } else {
        audio.muted = isMutedRef.current; // sync current state
      }

      if (!audio) {
        playSequentially(index + 1);
        return;
      }

      audio.onended = () => {
        playSequentially(index + 1);
      };

      audio.onerror = (e) => {
        console.warn(`Prefetched Server TTS failed for segment index ${index}: "${segments[index]}"`, e);
        playSequentially(index + 1);
      };

      audio.play().catch(err => {
        console.warn("HTML5 background audio play was blocked or rejected:", err);
        playSequentially(index + 1);
      });
    };

    // Begin sequential playback loop
    playSequentially(0);

  }, [stopAllAudio]);

  // Handle frame capture and AI process
  const handleCapture = useCallback(async (imageData: string) => {
    if (isScanning) return;
    setIsScanning(true);
    setErrorText(null);
    try {
      const result = await analyzeOutfitFromCamera(imageData);
      if (result && result.score) {
        setAnalysis(result);
        
        // Add introductory message describing the new outfit context
        const introMessage = `Mình vừa xem qua outfit bạn đang mặc nhé! Bộ đồ đạt khoảng ${result.score} điểm, mang phong cách ${result.style} khá là ổn đó. ${result.advice[0] || ''}`;
        setVoiceHistory(prev => [
          ...prev,
          { role: 'assistant', content: introMessage }
        ]);
        
        // Speak the evaluation automatically if voice chat is ready or on
        if (isPlayingRef.current) {
          console.log('AI is currently speaking. Queueing system scan intro message:', introMessage);
          pendingScanSpeechRef.current = introMessage;
        } else {
          playAudio(introMessage);
        }
      } else {
        setErrorText('Không nhận dạng được trang phục rõ ràng trong khung hình. Vui lòng căn chỉnh lại tư thế đứng.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorText('Kết nối AI bị gián đoạn. Vui lòng quét thử lại.');
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, playAudio]);

  // Handle speech voice core animation
  useEffect(() => {
    let intervalId: any;
    if (voiceStatus === 'Speaking' || voiceStatus === 'Listening') {
      intervalId = setInterval(() => {
        setWaveHeightMultiplier(Math.random() * 1.5 + 0.5);
      }, 100);
    } else if (voiceStatus === 'Thinking') {
      intervalId = setInterval(() => {
        setWaveHeightMultiplier(0.3 + Math.sin(Date.now() / 200) * 0.1);
      }, 50);
    } else {
      setWaveHeightMultiplier(0.15);
    }

    return () => clearInterval(intervalId);
  }, [voiceStatus]);

  // Submit voice or text messages to Gemini Chat incorporating Outfit context
  const handleVoiceSubmit = async (text: string) => {
    if (!text.trim()) return;

    // Proactively unlock the Safari/iOS HTML5 Audio Context inside user form submits
    unlockAudioPool();

    // Reset current audio playback streams immediately
    stopAllAudio();
    // Clear pending scan speech as the user triggered a new conversational turn
    pendingScanSpeechRef.current = null;

    // Add user question to history, reading from ref to avoid stale closure state
    const currentHistory = voiceHistoryRef.current;
    const updatedHistory = [...currentHistory, { role: 'user' as const, content: text }];
    setVoiceHistory(updatedHistory);
    setUserInput('');
    setVoiceTranscript('');
    voiceTranscriptRef.current = '';
    setVoiceStatus('Thinking');

    try {
      const currentAnalysis = analysisRef.current;
      const chatContext = {
        source: 'camera_outfit_analysis',
        outfit: currentAnalysis ? {
          score: currentAnalysis.score,
          style: currentAnalysis.style,
          items: currentAnalysis.items,
          tags: currentAnalysis.tags,
          advice: currentAnalysis.advice
        } : null
      };

      const formattedMessagesForApi = updatedHistory.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const reply = await chatWithAI(formattedMessagesForApi, chatContext);
      if (reply) {
        setVoiceHistory(prev => [...prev, { role: 'assistant', content: reply }]);
        playAudio(reply);
      } else {
        const errorReply = 'Tôi chưa tiếp cận được luồng tín hiệu, bạn có thể hỏi lại lần nữa được không?';
        setVoiceHistory(prev => [...prev, { role: 'assistant', content: errorReply }]);
        playAudio(errorReply);
      }
    } catch (err) {
      console.error(err);
      setVoiceStatus('Ready');
    } finally {
      isSubmittingVoiceRef.current = false;
    }
  };

  // Keep the voice submission handler ref in sync
  useEffect(() => {
    handleVoiceSubmitRef.current = handleVoiceSubmit;
  }, [handleVoiceSubmit]);

  // Toggle record session
  const toggleMic = () => {
    // Proactively unlock the Safari/iOS HTML5 Audio Context inside user voice clicks
    unlockAudioPool();

    if (!isSpeechSupported) {
      alert('Trình duyệt của bạn chưa hỗ trợ giọng nói (Speech Recognition). Hãy sử dụng ô gõ văn bản bên dưới.');
      return;
    }

    if (voiceStatus === 'Listening') {
      recognitionRef.current?.stop();
    } else {
      stopAllAudio(); // Stop talking before start listening
      pendingScanSpeechRef.current = null; // Clear pending scan speech as the user wishes to speak
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Mic already active or failed:', err);
      }
    }
  };

  // Helper colors for Score range
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-amber-500 border-amber-500 bg-amber-500/10';
    if (score >= 80) return 'text-brand-gold border-brand-gold bg-brand-gold/10';
    if (score >= 70) return 'text-emerald-500 border-emerald-500 bg-emerald-500/10';
    return 'text-slate-400 border-slate-500 bg-slate-500/10';
  };

  return (
    <div 
      className={`fixed inset-0 z-[600] ${theme.bg} flex flex-col overflow-y-auto no-scrollbar font-sans antialiased`}
      onClick={unlockAudioPool}
      onTouchStart={unlockAudioPool}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .safe-notch-header {
          padding-top: calc(1rem + env(safe-area-inset-top, 0px)) !important;
        }
      `}} />
      {/* Dynamic Header */}
      <header className={`border-b ${theme.header} backdrop-blur-md px-6 py-4 safe-notch-header sticky top-0 z-50 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose} 
            className={`w-10 h-10 rounded-full ${theme.backBtn} flex items-center justify-center transition-all cursor-pointer`}
            id="back_btn"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-brand-gold' : 'bg-brand-goldLight'} animate-ping`} />
              <h1 className={`text-base sm:text-lg md:text-xl font-black tracking-[0.12em] md:tracking-[0.18em] [word-spacing:0.3rem] md:[word-spacing:0.5em] uppercase ${isDark ? 'bg-gradient-to-r from-white via-slate-150 to-brand-gold bg-clip-text text-transparent' : 'text-brand-goldLight'}`}>
                PHÒNG TƯ VẤN OUTFIT AI
              </h1>
            </div>
            <p className={`text-xs ${theme.headerSub}`}>STYLIST PERSONAL AI CONSULTANT</p>
          </div>
        </div>

        {/* System statuses panel */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <span className={`px-2.5 py-1 rounded-full ${theme.statusBadge} border flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cameraStatus === 'Connected' ? 'bg-emerald-500' : 'bg-red-400'}`} />
            Camera: {cameraStatus}
          </span>
          <span className={`px-2.5 py-1 rounded-full ${theme.statusBadge} border flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${aiConnected ? 'bg-emerald-505 animate-pulse' : 'bg-red-400'}`} />
            AI Core: {aiConnected ? 'Active' : 'Offline'}
          </span>
          <span className={`px-2.5 py-1 rounded-full ${theme.statusBadge} border flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${voiceStatus !== 'Off' ? (isDark ? 'bg-brand-gold' : 'bg-brand-goldLight') : 'bg-slate-500'}`} />
            Voice Core: {voiceStatus}
          </span>
          <span className={`px-2.5 py-1 rounded-full ${theme.statusBadge} border flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isScanning ? (isDark ? 'bg-brand-gold animate-bounce' : 'bg-brand-goldLight animate-bounce') : 'bg-slate-550'}`} />
            Scanning: {isScanning ? 'Processing' : 'Idle'}
          </span>
        </div>
      </header>

      {/* Main body viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Video preview and timing controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`rounded-[2.2rem] ${theme.cardBg} p-6 relative overflow-hidden`}>
            {/* Corner metallic styles */}
            <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${isDark ? 'border-brand-gold/40' : 'border-brand-red/35'} rounded-tl-3xl pointer-events-none`} />
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${isDark ? 'border-brand-gold/40' : 'border-brand-red/35'} rounded-tr-3xl pointer-events-none`} />
            <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${isDark ? 'border-brand-gold/40' : 'border-brand-red/35'} rounded-bl-3xl pointer-events-none`} />
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${isDark ? 'border-brand-gold/40' : 'border-brand-red/35'} rounded-br-3xl pointer-events-none`} />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h2 className={`font-mono text-xs uppercase tracking-widest ${theme.cardSubTitle}`}>Live Camera Stream</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCameraActive(prev => !prev)}
                  className={`text-xs px-3 py-1 rounded-full transition-all cursor-pointer font-semibold ${cameraActive ? 'bg-brand-red text-white' : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}
                >
                  {cameraActive ? 'Tắt Cam' : 'Bật Cam'}
                </button>
              </div>
            </div>

            <CameraScanner 
              onCapture={handleCapture}
              isScanning={isScanning}
              captureTrigger={captureTrigger}
              cameraActive={cameraActive}
              onStatusChange={setCameraStatus}
            />

            {errorText && (
              <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-sm rounded-xl flex items-center gap-2.5">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p>{errorText}</p>
              </div>
            )}
          </div>

          {/* Timing controls, manual trigger card */}
          <div className={`rounded-3xl ${theme.cardBg} p-6`}>
            <h3 className={`font-bold text-sm ${theme.cardTitle} uppercase tracking-wider mb-4 flex items-center gap-2`}>
              <Zap size={16} className={isDark ? 'text-brand-gold' : 'text-brand-red'} /> Cài đặt & Quét và phân tích
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Auto Scan Setup */}
              <div className={`space-y-3 ${isDark ? 'border-r border-slate-800/60' : 'border-r border-red-105/40'} pr-0 md:pr-6`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className={`text-sm font-semibold ${theme.labelColor}`}>Tự động Quét (Auto Scan)</label>
                    <p className={`text-xs ${theme.labelDesc}`}>Tự chụp & gửi phân tích theo chu kỳ</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoScan(prev => !prev)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoScan ? (isDark ? 'bg-brand-gold' : 'bg-brand-red') : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${autoScan ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white'}`} />
                  </button>
                </div>

                <div className="pt-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="30"
                      max="300"
                      value={customSeconds}
                      onChange={(e) => {
                        const valStr = e.target.value;
                        setCustomSeconds(valStr);
                        const val = parseInt(valStr, 10);
                        if (!isNaN(val) && val >= 30 && val <= 300) {
                          setAutoScanInterval(val * 1000);
                        }
                      }}
                      onBlur={() => {
                        let val = parseInt(customSeconds, 10);
                        if (isNaN(val) || val < 30) {
                          val = 30;
                        } else if (val > 300) {
                          val = 300;
                        }
                        setCustomSeconds(val.toString());
                        setAutoScanInterval(val * 1000);
                      }}
                      className={`w-full ${theme.inputBg} font-mono text-xs px-3.5 py-2 rounded-xl border transition-all focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      placeholder="Chu kỳ"
                    />
                    <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold ${theme.inputSuf} pointer-events-none`}>
                      giây (s)
                    </span>
                  </div>
                  <p className={`text-[10px] uppercase font-mono tracking-wider mt-1.5 ${theme.textMuted}`}>
                    * Nhập khoảng từ 30s đến 300s (5 phút)
                  </p>
                </div>

                {autoScan && (
                  <div className={`text-xs font-mono ${isDark ? 'text-brand-gold' : 'text-brand-red'} flex items-center gap-1.5 animate-pulse pt-1`}>
                    <RefreshCw size={12} className="animate-spin" />
                    Chụp tiếp theo sau {countDown >= 60 ? `${Math.floor(countDown / 60)} phút${countDown % 60 > 0 ? ` ${countDown % 60} giây` : ''}` : `${countDown} giây`}...
                  </div>
                )}
              </div>

              {/* Manual Snap action */}
              <div className="text-center md:text-left">
                <div className="mb-3">
                  <label className={`text-sm font-semibold ${theme.labelColor}`}>Chụp và Phân tích tối ưu</label>
                  <p className={`text-xs ${theme.labelDesc}`}>Gửi ảnh lấy tư vấn ngay tức thì</p>
                </div>
                
                <button
                  type="button"
                  onClick={triggerManualScan}
                  disabled={isScanning || !cameraActive}
                  className={`w-full ${theme.btnAction} py-3.5 px-6 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Zap size={16} className={isDark ? 'fill-slate-950 text-slate-950' : 'fill-white text-white'} />
                      QUÉT PHONG CÁCH NGAY
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Fashion Evaluation + Voice Stylist interaction */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section: Score, style tag and stylist response details */}
          <div className={`rounded-[2.2rem] ${theme.cardBg} p-6 relative`}>
            <div className={`flex items-center gap-3 border-b ${theme.border} pb-4 mb-4`}>
              <div className={`w-10 h-10 rounded-full ${theme.accentBg} flex items-center justify-center ${theme.accentText}`}>
                <Award size={20} />
              </div>
              <div>
                <h3 className={`font-bold text-base ${theme.textBold}`}>Đánh giá Phong Cách AI</h3>
                <p className={`text-xs ${theme.textMuted} font-mono`}>Realtime Fashion Analytics</p>
              </div>
            </div>

            {analysis ? (
              <div className="space-y-6">
                {/* Visual scorecard gauge */}
                <div className={`flex items-center gap-4 ${theme.soundwaveBg} p-4 rounded-2xl border`}>
                  <div className={`w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center font-black ${theme.scoreRing(analysis.score)}`}>
                    <span className="text-xl font-black">{analysis.score}</span>
                    <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">Điểm</span>
                  </div>
                  <div>
                    <div className={`text-xs ${theme.accentText} uppercase tracking-widest font-bold`}>Phong cách</div>
                    <div className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{analysis.style}</div>
                  </div>
                </div>

                {/* Detected articles chips list */}
                <div className="space-y-2">
                  <div className={`text-xs ${theme.textMuted} font-mono uppercase`}>Trang phục nhận diện</div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.items?.map((item, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded-lg ${isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-red-50/10 border-red-100 text-slate-800'} text-xs border`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social style hashtags */}
                <div className="space-y-2">
                  <div className={`text-xs ${theme.textMuted} font-mono uppercase`}>Hashtag liên kết</div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.tags?.map((tag, idx) => (
                      <span key={idx} className={`text-xs font-semibold ${theme.hashtagTag} px-2.5 py-1 rounded-md border`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Advice details bullets */}
                <div className={`space-y-3 ${theme.soundwaveBg} p-4 rounded-2xl border`}>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1 font-mono uppercase`}>
                    <Sparkles size={12} className={isDark ? 'text-brand-gold' : 'text-brand-red'} /> Khuyên dùng nâng cấp
                  </div>
                  <ul className="space-y-2.5">
                    {analysis.advice?.map((adv, idx) => (
                      <li key={idx} className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm flex gap-2`}>
                        <CheckCircle2 size={15} className={`${theme.bulletIcon} shrink-0 mt-0.5`} />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className={`w-16 h-16 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-red-50/30 border-red-105 text-brand-red/60'} rounded-full border-2 border-dashed flex items-center justify-center mx-auto`}>
                  <Bot size={28} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${theme.textMain}`}>Chưa có kết quả quét nào</p>
                  <p className={`text-xs ${theme.textMuted} max-w-xs mx-auto mt-1`}>Cần chỉnh tư thế đứng trước ống kính camera và bấm bắt đầu quét mẫu để nhận lời khuyên thiết kế từ stylist.</p>
                </div>
              </div>
            )}
          </div>

          {/* Section: Voice Stylist Assistant Core */}
          <div className={`rounded-[2.2rem] ${theme.cardBg} p-6 space-y-4`}>
            <div className={`flex items-center justify-between border-b ${theme.border} pb-3`}>
              <div className="flex items-center gap-2">
                <Mic size={18} className={isDark ? 'text-brand-gold' : 'text-brand-red'} />
                <h3 className={`font-bold text-sm tracking-widest ${theme.textBold} uppercase`}>Stylist Voice Chat Core</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(m => !m)}
                  className={`p-1 px-2.5 ${isDark ? 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white' : 'bg-red-50/50 hover:bg-red-50 border-red-102 text-brand-red'} rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX size={13} className="text-red-400" /> Sound Off
                    </>
                  ) : (
                    <>
                      <Volume2 size={13} className="text-emerald-400" /> Sound On
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Glowing Soundwave visualization container */}
            <div className={`${theme.soundwaveBg} rounded-2xl p-5 border relative overflow-hidden flex flex-col items-center justify-center gap-3`}>
              
              {/* Dynamic Status Display badge inside Wave */}
              <div className="absolute top-3 left-4 text-[10px] font-mono select-none">
                {voiceStatus === 'Listening' && <span className={theme.soundwaveIndicator('Listening')}>● STYLIST ĐANG NGHE...</span>}
                {voiceStatus === 'Thinking' && <span className={theme.soundwaveIndicator('Thinking')}>● ĐANG TÌM TƯ VẤN...</span>}
                {voiceStatus === 'Speaking' && <span className={theme.soundwaveIndicator('Speaking')}>● STYLIST ĐANG NÓI...</span>}
                {voiceStatus === 'Ready' && <span className={theme.soundwaveIndicator('Ready')}>● SOUNDWAVE READY</span>}
                {voiceStatus === 'Off' && <span className={theme.soundwaveIndicator('Off')}>● STANDBY MODE</span>}
              </div>

              {/* Sóng âm realtime simulated */}
              <div className="flex items-center justify-center gap-1 hover:opacity-80 transition-all h-16 w-full max-w-sm pt-4">
                {Array.from({ length: 16 }).map((_, i) => {
                  // Generate default base heights relative to indexes for oval visual wave
                  const baseHeight = 10 + Math.sin((i / 15) * Math.PI) * 35;
                  const targetHeight = Math.max(8, baseHeight * waveHeightMultiplier);

                  return (
                    <motion.div
                      key={i}
                      className={`w-1 rounded-full ${theme.scWave(voiceStatus)}`}
                      animate={{ height: targetHeight }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  );
                })}
              </div>

              {/* Instant speak trigger control */}
              <button
                type="button"
                onClick={toggleMic}
                className={`p-4 rounded-full shadow-lg border cursor-pointer hover:scale-105 active:scale-95 transition-all text-slate-950 flex items-center justify-center relative ${theme.scWaveMicBtn(voiceStatus)}`}
              >
                {voiceStatus === 'Listening' ? (
                  <MicOff size={20} className="text-white fill-transparent" />
                ) : (
                  <Mic size={20} className={`${isDark ? 'text-slate-955' : 'text-white'} fill-transparent`} />
                )}

                {voiceStatus === 'Listening' && (
                  <span className="absolute inset-0 rounded-full border border-red-500 animate-ping" />
                )}
              </button>

              <div className={`text-xs text-center font-semibold mt-1 ${theme.textMuted}`}>
                {voiceStatus === 'Listening' ? 'Bấm MIC để hoàn tất nói' : 'Bật MIC & trò chuyện với Stylist'}
              </div>

              {voiceStatus === 'Listening' && voiceTranscript && (
                <div className={`text-xs text-center max-w-xs animate-pulse px-3 py-1.5 rounded-xl border font-medium mt-1 ${isDark ? 'text-blue-300 bg-blue-950/40 border-blue-900/30' : 'text-blue-600 bg-blue-50/50 border-blue-200/50'}`}>
                  "{voiceTranscript}"
                </div>
              )}
            </div>

            {/* Chat Transcript Window */}
            <div ref={chatScrollRef} className={`max-h-48 overflow-y-auto no-scrollbar space-y-3.5 border p-4 rounded-2xl text-xs ${theme.chatBox}`}>
              <div className={`text-[10px] font-mono tracking-wider font-extrabold border-b pb-1 ${theme.chatBoxTitle}`}>
                HỘI THOẠI TRỰC TIẾP (LIVE CONTEXT)
              </div>
              <div className="space-y-3">
                {voiceHistory.map((chat, idx) => (
                  <div key={idx} className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className={`text-[9px] font-semibold uppercase tracking-tighter mb-0.5 ${theme.chatSenderLabel}`}>
                      {chat.role === 'user' ? 'Khách hàng' : 'AI Stylist'}
                    </span>
                    <div className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed border ${chat.role === 'user' ? theme.chatUserBubble : theme.chatAIBubble}`}>
                      {chat.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual text inputs fallback bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleVoiceSubmit(userInput); }} className="flex gap-2">
              <input
                type="text"
                placeholder="Đặt câu hỏi, ví dụ: Tôi phối giày nào hợp?..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className={`flex-1 text-sm py-2 px-3.5 rounded-xl transition-all focus:outline-none ${theme.inputBg}`}
              />
              <button
                type="submit"
                disabled={!userInput.trim()}
                className={`px-4 py-2 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 border ${isDark ? 'bg-slate-850 hover:bg-slate-800 text-brand-gold border-slate-800' : 'bg-brand-red hover:bg-red-700 text-white border-red-200 shadow-sm'}`}
              >
                <Send size={15} />
              </button>
            </form>

          </div>

        </div>

      </main>
    </div>
  );
};
