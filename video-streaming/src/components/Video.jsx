import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { IoIosSettings } from "react-icons/io";

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null); // Store the Hls instance here
  const [resolutions, setResolutions] = useState([]);
  const [showResolutions, setShowResolutions] = useState(false);

  useEffect(() => {
    if (Hls.isSupported()) {
      const videoElement = videoRef.current;
      const hls = new Hls();
      hlsRef.current = hls; // Save Hls instance in ref
      hls.loadSource(videoUrl);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels;
        const availableResolutions = levels.map((level, index) => ({
          height: level.height,
          bitrate: level.bitrate,
          index: index,  // Store index here for resolution change
        }));
        setResolutions(availableResolutions);
      });

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        console.log('Levels loaded:', data.levels);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS.js error:', data.fatal);
        }
      });

      return () => {
        hls.destroy();
      };
    } else {
      console.error('HLS is not supported in this browser.');
    }
  }, [videoUrl]);

  const handleResolutionChange = (index) => {
    const hls = hlsRef.current;
    if (hls && hls.levels.length > index) {
      hls.currentLevel = index;  // Change the resolution
    }
    setShowResolutions(false);  // Hide dropdown after selection
  };

  return (
    <div className='relative w-full max-w-[400px] aspect-[16/9]'>
  <video
    ref={videoRef}
    controls
    className='border-2 rounded-md w-full h-full object-cover'
  />

</div>

  );
};

export default VideoPlayer;
