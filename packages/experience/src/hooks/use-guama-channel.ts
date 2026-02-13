import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const GUAMA_CHANNEL_KEY = 'guama_channel';
const GUAMA_CHANNEL_PARAM = 'guama_chanel'; // Note: keeping the typo from the URL parameter

/**
 * Hook to detect and persist the guama_chanel URL parameter
 *
 * Usage:
 * - Detects if URL has `guama_chanel=app` parameter
 * - Saves the flag to localStorage when detected
 * - Returns the current channel value from localStorage
 * - Provides a method to clear the stored value
 *
 * @returns {Object} - { isAppChannel: boolean, channel: string | null, clearChannel: () => void }
 */
const useGuamaChannel = () => {
  const [searchParams] = useSearchParams();
  const [channel, setChannel] = useState<string | null>(() => {
    // Initialize from localStorage
    return localStorage.getItem(GUAMA_CHANNEL_KEY);
  });

  useEffect(() => {
    // Check if the URL has the guama_chanel parameter
    const channelParam = searchParams.get(GUAMA_CHANNEL_PARAM);

    if (channelParam) {
      // Save to localStorage
      localStorage.setItem(GUAMA_CHANNEL_KEY, channelParam);
      setChannel(channelParam);
    }
  }, [searchParams]);

  const clearChannel = () => {
    localStorage.removeItem(GUAMA_CHANNEL_KEY);
    setChannel(null);
  };

  return {
    /** Whether the channel is 'app' */
    isAppChannel: channel === 'app',
    /** The current channel value (e.g., 'app') or null */
    channel,
    /** Clear the stored channel value */
    clearChannel,
  };
};

export default useGuamaChannel;
