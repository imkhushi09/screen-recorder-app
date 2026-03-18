import { useEffect,useRef, useState } from "react";

type RecorderProps = {
  setVideoBlob: (blob: Blob | null) => void;
};

const Recorder = ({ setVideoBlob }: RecorderProps) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);



  useEffect(() => {
  if (!recording) return;

  const interval = setInterval(() => {
    setSeconds((prev) => prev + 1);
  }, 1000);

  return () => {
    clearInterval(interval);
  };
}, [recording]);


const startRecording = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });

  streamRef.current = stream;

  stream.getTracks().forEach((track) => {
   track.onended = () => {
  // Force stop recorder
  mediaRecorderRef.current?.stop();

  // Stop all tracks
  streamRef.current?.getTracks().forEach((t) => t.stop());

  // Force UI state reset
  setRecording(false);
  setSeconds(0);
};

  });

  const recorder = new MediaRecorder(stream);
  mediaRecorderRef.current = recorder;

  recorder.ondataavailable = (e) => {
    chunksRef.current.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    setVideoBlob(blob);
    chunksRef.current = [];
  };

  setSeconds(0);
  setRecording(true);
  recorder.start();
};

const stopRecording = () => {
  if (!recording) return;

  mediaRecorderRef.current?.stop();
  streamRef.current?.getTracks().forEach((track) => track.stop());

  setRecording(false);
  setSeconds(0); // ✅ RESET TIMER WHEN STOPPED
};




  const resetRecording = () => {
    setVideoBlob(null);
    setSeconds(0);
  };

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-8">
      {/* Status Indicator */}
      <div className="flex items-center justify-center">
        <div className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
          recording 
            ? "bg-red-500/20 border border-red-500/30" 
            : "bg-white/10 border border-white/20"
        }`}>
          <div className={`w-3 h-3 rounded-full mr-3 ${
            recording ? "bg-red-500 animate-pulse" : "bg-gray-400"
          }`}></div>
          <span className={`text-sm font-medium ${
            recording ? "text-red-300" : "text-gray-300"
          }`}>
            {recording ? "Recording in Progress" : "Ready to Record"}
          </span>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="text-5xl font-mono font-bold text-white tracking-wider tabular-nums">
            {formatTime(seconds)}
          </div>
        </div>
        {recording && (
          <div className="mt-3 flex items-center justify-center">
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-3 bg-red-400 rounded-full animate-pulse animation-delay-200"></div>
              <div className="w-1 h-3 bg-red-400 rounded-full animate-pulse animation-delay-400"></div>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col items-center space-y-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-red-500/25 border border-red-500/20"
          >
            <span className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
              </svg>
              Start Recording
            </span>
            <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="group relative px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-gray-500/25 border border-gray-500/20"
          >
            <span className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd"/>
              </svg>
              Stop Recording
            </span>
            <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        )}

        {/* Reset Button */}
        <button
          onClick={resetRecording}
          disabled={recording}
          className={`group px-6 py-3 rounded-xl font-medium transition-all duration-300 border ${
            recording 
              ? "text-gray-500 bg-white/5 border-gray-600/30 cursor-not-allowed" 
              : "text-gray-300 bg-white/10 border-white/20 hover:bg-white/20 hover:text-white hover:border-white/30 hover:scale-105"
          }`}
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset & Record Again
          </span>
        </button>
      </div>

      {/* Recording Tips */}
      <div className="text-center">
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          {recording 
            ? "Share your screen when prompted by your browser"
            : "Click to start recording your screen with audio"
          }
        </p>
      </div>
    </div>
  );
};

export default Recorder;

