import { useEffect, useState } from "react";

type VideoMetaProps = {
  videoBlob: Blob;
};

const VideoMeta = ({ videoBlob }: VideoMetaProps) => {
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(videoBlob);

    video.src = url;
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      URL.revokeObjectURL(url);
    };
  }, [videoBlob]);

  const sizeMB = (videoBlob.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="mt-3 text-sm text-gray-700">
      <p>📏 Duration: {duration.toFixed(2)} seconds</p>
      <p>💾 Size: {sizeMB} MB</p>
    </div>
  );
};

export default VideoMeta;
