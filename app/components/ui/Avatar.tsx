import React, { useState } from 'react';
import { View, Text, Image, ImageStyle } from 'react-native';

interface AvatarProps {
  uri?: string;
  size?: number;
  fallback?: string;
}

export function Avatar({ uri, size = 40, fallback = '?' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const imageStyle: ImageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  // Show fallback if no URI, image failed to load, or still loading
  const showFallback = !uri || imageError || imageLoading;

  return (
    <View
      className="bg-primary rounded-full items-center justify-center"
      style={{ width: size, height: size }}
    >
      {uri && !imageError && (
        <Image
          source={{ uri }}
          style={imageStyle}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      )}
      {showFallback && (
        <Text
          className="text-text font-bold"
          style={{ fontSize: size * 0.4 }}
        >
          {fallback}
        </Text>
      )}
    </View>
  );
}