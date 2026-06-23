import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedTouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scaleTo?: number;
}

export default function AnimatedTouchable({ 
  children, 
  scaleTo = 0.97, 
  style,
  onPressIn,
  onPressOut,
  ...props 
}: AnimatedTouchableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleTo, { damping: 15, stiffness: 200 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 12, stiffness: 150 });
    onPressOut?.(e);
  };

  return (
    <AnimatedTouchableOpacity
      {...props}
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
}