// const API_URL = import.meta.env.VITE_API_URL;
// import { useAuth } from "../context/AuthContext";
// import axios from "axios";
// import { useEffect, useState } from "react";

// type Recording = {
//   filename: string;
//   duration: number;
//   size: number;
//   uploaded_at: string;
//   video_url: string;
// };

// type Props = {
//   refresh: number;
// };

// // const RecordingsList = () => {

// const RecordingsList = ({ refresh }: Props) => {
//   const { token } = useAuth();
//   const [recordings, setRecordings] = useState<Recording[]>([]);
//   const [loading, setLoading] = useState(true);

//   // 🔹 Fetch recordings
//   const fetchRecordings = async () => {
//     try {
// const res = await axios.get(`${API_URL}/recordings`);
//       setRecordings(res.data);
//     } catch (err) {
//       console.error("Error fetching recordings", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRecordings();
//   }, [refresh]);

//   // 🔴 Delete function
//   const handleDelete = async (filename: string) => {
//     const confirmDelete = window.confirm(`Delete "${filename}"?`);
//     if (!confirmDelete) return;

//     try {
//       // Properly encode the filename for URL
//       const encodedFilename = encodeURIComponent(filename);

//       // Try different endpoint formats
// let deleteUrl = `${API_URL}/delete/${encodedFilename}`;
//       console.log('Attempting to delete:', {
//         original: filename,
//         encoded: encodedFilename,
//         url: deleteUrl
//       });
      
//       await axios.delete(deleteUrl);

//       // update UI
//       setRecordings((prev) =>
//         prev.filter((r) => r.filename !== filename)
//       );
//     } catch (err: any) {
//       console.error("Delete failed", err);
//       console.error("Error details:", {
//         status: err.response?.status,
//         statusText: err.response?.statusText,
//         data: err.response?.data,
//         url: err.config?.url
//       });

//       // Try alternative endpoint if 404
//       if (err.response?.status === 404) {
//         try {
//           console.log('Trying alternative endpoint...');
// const altUrl = `${API_URL}/api/delete/${encodeURIComponent(filename)}`;   
//        await axios.delete(altUrl);

//           setRecordings((prev) =>
//             prev.filter((r) => r.filename !== filename)
//           );
//           console.log(`Successfully deleted via alternative: ${filename}`);
//         } catch (altErr: any) {
//           alert(`Failed to delete recording. Please check if the delete endpoint exists on the server. Error: ${altErr.response?.data?.message || altErr.message || 'Unknown error'}`);
//         }
//       } else {
//         alert(`Failed to delete recording: ${err.response?.data?.message || err.message || 'Unknown error'}`);
//       }
//     }
//   };

//   // ⬇️ Download function
//   const handleDownload = (filename: string, videoUrl: string) => {
//     const link = document.createElement('a');
//     link.href = videoUrl;
//     link.download = filename;
//     link.target = '_blank';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="flex items-center space-x-3">
//           <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
//             <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//           </div>
//           <span className="text-gray-300 font-medium">Loading recordings...</span>
//         </div>
//       </div>
//     );
//   }

//   if (recordings.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
//           <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//           </svg>
//         </div>
//         <p className="text-gray-400 font-medium text-lg">No recordings yet</p>
//         <p className="text-gray-500 text-sm mt-1">Your uploaded recordings will appear here</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Grid layout for recordings */}
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {recordings.map((rec) => (
//           <div
//             key={rec.filename}
//             className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:bg-white/10 hover:shadow-xl hover:shadow-white/5"
//           >
//             {/* Video Thumbnail */}
//             <div className="relative aspect-video bg-black/50 overflow-hidden">
//               <video
//                 src={rec.video_url}
//                 className="w-full h-full object-cover"
//                 onMouseEnter={(e) => e.currentTarget.play()}
//                 onMouseLeave={(e) => e.currentTarget.pause()}
//                 muted
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//               <div className="absolute top-3 right-3">
//                 <span className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white font-medium">
//                   {rec.duration}s
//                 </span>
//               </div>
//             </div>

//             {/* Card Content */}
//             <div className="p-4 space-y-3">
//               {/* File Info */}
//               <div className="space-y-2">
//                 <h3 className="text-white font-medium text-sm truncate" title={rec.filename}>
//                   {rec.filename}
//                 </h3>
//                 <div className="flex items-center justify-between text-xs text-gray-400">
//                   <span className="flex items-center">
//                     <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
//                     </svg>
//                     {rec.size} MB
//                   </span>
//                   <span className="flex items-center">
//                     <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
//                     </svg>
//                     {new Date(rec.uploaded_at).toLocaleDateString()}
//                   </span>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="grid grid-cols-3 gap-2">
//                 <button
//                   onClick={() => handleDownload(rec.filename, rec.video_url)}
//                   className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 border border-green-400/30"
//                 >
//                   <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
//                   </svg>
//                   Download
//                 </button>
//                 <button
//                   onClick={() => window.open(rec.video_url, '_blank')}
//                   className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 border border-blue-400/30"
//                 >
//                   <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                   </svg>
//                   Open
//                 </button>
//                 <button
//                   onClick={() => handleDelete(rec.filename)}
//                   className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 border border-red-400/30"
//                 >
//                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                   </svg>
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Summary Stats */}
//       <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
//         <div className="flex items-center justify-between text-sm">
//           <span className="text-gray-400">
//             Total Recordings: <span className="text-white font-medium">{recordings.length}</span>
//           </span>
//           <span className="text-gray-400">
//             Total Size: <span className="text-white font-medium">
//               {(recordings.reduce((acc, rec) => acc + rec.size, 0)).toFixed(2)} MB
//             </span>
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RecordingsList;


const API_URL = import.meta.env.VITE_API_URL;
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";

type Recording = {
  filename: string;
  duration: number;
  size: number;
  uploaded_at: string;
  video_url: string;
};

type Props = {
  refresh: number;
};

const RecordingsList = ({ refresh }: Props) => {
  const { token } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecordings = async () => {
    try {
      const res = await axios.get(`${API_URL}/recordings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecordings(res.data);
    } catch (err) {
      console.error("Error fetching recordings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, [refresh]);

  const handleDelete = async (filename: string) => {
    const confirmDelete = window.confirm(`Delete "${filename}"?`);
    if (!confirmDelete) return;

    try {
      const encodedFilename = encodeURIComponent(filename);
      const deleteUrl = `${API_URL}/delete/${encodedFilename}`;

      await axios.delete(deleteUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecordings((prev) => prev.filter((r) => r.filename !== filename));
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(`Failed to delete recording: ${err.response?.data?.detail || err.message || 'Unknown error'}`);
    }
  };

  const handleDownload = (filename: string, videoUrl: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span className="text-gray-300 font-medium">Loading recordings...</span>
        </div>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-400 font-medium text-lg">No recordings yet</p>
        <p className="text-gray-500 text-sm mt-1">Your uploaded recordings will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recordings.map((rec) => (
          <div
            key={rec.filename}
            className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:bg-white/10 hover:shadow-xl hover:shadow-white/5"
          >
            <div className="relative aspect-video bg-black/50 overflow-hidden">
              <video
                src={rec.video_url}
                className="w-full h-full object-cover"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => e.currentTarget.pause()}
                muted
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-3 right-3">
                <span className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white font-medium">
                  {rec.duration}s
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <h3 className="text-white font-medium text-sm truncate" title={rec.filename}>
                  {rec.filename}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                    </svg>
                    {rec.size} MB
                  </span>
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                    {new Date(rec.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleDownload(rec.filename, rec.video_url)}
                  className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 border border-green-400/30"
                >
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => window.open(rec.video_url, '_blank')}
                  className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 border border-blue-400/30"
                >
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open
                </button>
                <button
                  onClick={() => handleDelete(rec.filename)}
                  className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 border border-red-400/30"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Total Recordings: <span className="text-white font-medium">{recordings.length}</span>
          </span>
          <span className="text-gray-400">
            Total Size: <span className="text-white font-medium">
              {(recordings.reduce((acc, rec) => acc + rec.size, 0)).toFixed(2)} MB
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecordingsList;