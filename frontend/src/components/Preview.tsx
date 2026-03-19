const API_URL = import.meta.env.VITE_API_URL;
import axios from "axios";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

type PreviewProps = {
  videoBlob: Blob | null;
  setVideoBlob: (blob: Blob | null) => void;
  onUploadSuccess: () => void;
};

const Preview = ({ videoBlob, setVideoBlob, onUploadSuccess }: PreviewProps) => {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (!videoBlob) { setPreviewUrl(""); return; }
    const url = URL.createObjectURL(videoBlob);
    setPreviewUrl(url);
    return () => { URL.revokeObjectURL(url); };
  }, [videoBlob]);

  useEffect(() => {
    setUploaded(false);
    setProgress(0);
    setMessage("");
    setFileName("");
  }, [videoBlob]);

  if (!videoBlob) {
    return (
      <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center bg-white/5 backdrop-blur-sm">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-400 font-medium">No recording yet</p>
        <p className="text-gray-400 text-sm mt-1">Start recording to see preview here</p>
      </div>
    );
  }

  if (uploaded) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Upload Complete!</h3>
          <button
            onClick={() => {
              setVideoBlob(null);
              setUploaded(false);
              setProgress(0);
              setMessage("");
            }}
            className="mt-4 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl font-medium transition-colors duration-200 border border-blue-500/30 hover:border-blue-500/50"
          >
            Record New Video
          </button>
        </div>
      </div>
    );
  }

  const handleUpload = async () => {
    setUploading(true);
    setProgress(0);
    setMessage("");

    const sizeMB = Number((videoBlob.size / (1024 * 1024)).toFixed(2));
    const video = document.createElement("video");
    video.src = previewUrl;

    video.onloadedmetadata = async () => {
      const duration = Number(video.duration.toFixed(2));
      const formData = new FormData();
      const finalFileName = fileName.trim()
        ? `${fileName.trim()}.webm`
        : `recording-${Date.now()}.webm`;

      formData.append("file", videoBlob, finalFileName);
      formData.append("duration", duration.toString());
      formData.append("size", sizeMB.toString());

      try {
        const response = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,   // ← token added here
          },
          onUploadProgress: (event) => {
            if (!event.total) return;
            setProgress(Math.round((event.loaded * 100) / event.total));
          },
        });

        setUploaded(true);
        setMessage("✅ Uploaded successfully!");
        onUploadSuccess();
      } catch (error: any) {
        setMessage("❌ Upload failed");
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Video Preview</h3>
        {videoBlob && (
          <div className="flex items-center text-sm text-gray-300">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
            </svg>
            {(videoBlob.size / (1024 * 1024)).toFixed(2)} MB
          </div>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
        <video src={previewUrl} controls className="w-full h-auto max-h-80 object-contain" />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white text-xs font-medium">PREVIEW</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">File Name</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter custom file name (optional)"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
            disabled={uploading || uploaded}
          />
          <p className="text-xs text-gray-400">Leave empty to use default name (recording-timestamp.webm)</p>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || uploaded}
          className={`group relative w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-xl ${
            uploaded
              ? "bg-gradient-to-r from-green-500 to-green-600 cursor-not-allowed"
              : uploading
              ? "bg-gradient-to-r from-blue-400 to-blue-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25"
          }`}
        >
          <span className="flex items-center justify-center text-white">
            {uploaded ? (
              <>
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Successfully Uploaded
              </>
            ) : uploading ? (
              <>
                <svg className="w-6 h-6 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
              </>
            )}
          </span>
          <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        </button>

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Upload Progress</span>
              <span className="text-white font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className={`p-4 rounded-xl text-center font-medium ${
            message.includes("✅")
              ? "bg-green-500/20 border border-green-500/30 text-green-300"
              : "bg-red-500/20 border border-red-500/30 text-red-300"
          } backdrop-blur-sm`}>
            {message}
          </div>
        )}
      </div>

      {/* {serverVideoUrl && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-sm font-semibold text-gray-300 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"/>
            </svg>
            Uploaded Video
          </h4>
          <div className="relative rounded-2xl overflow-hidden bg-black shadow-xl border border-white/10">
            <video src={serverVideoUrl} controls className="w-full h-auto max-h-60 object-contain" />
            <div className="absolute top-4 right-4 bg-green-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-xs font-medium">UPLOADED</span>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Preview;
