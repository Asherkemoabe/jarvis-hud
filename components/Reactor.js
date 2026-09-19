import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, G, Line, Defs, RadialGradient, Stop } from 'react-native-svg';

// Lightweight arc-reactor visualization.
// Only 2 layers animate (a rotating dashed ring + a pulsing glow core),
// both driven by the native driver, so this stays cheap on low-end devices.
export default function Reactor({ size = 220, color = '#3ce8c9', coilCount = 9 }) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    spinLoop.start();
    pulseLoop.start();
    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [spin, pulse]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  const coils = [];
  for (let i = 0; i < coilCount; i++) {
    const angle = (360 / coilCount) * i;
    coils.push(
      <G key={i} rotation={angle} origin="100, 100">
        <Line x1="60" y1="100" x2="90" y2="100" stroke="#12181c" strokeWidth="10" strokeLinecap="round" />
        <Line x1="92" y1="100" x2="150" y2="100" stroke="#c87f4a" strokeWidth="9" strokeLinecap="round" />
      </G>
    );
  }

  return (
    <View style={{ width: size, height: size }}>
      {/* static rim + coil housing */}
      <Svg width={size} height={size} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
        <Circle cx="100" cy="100" r="96" stroke={color} strokeWidth="0.8" fill="none" opacity={0.4} />
        <G>{coils}</G>
      </Svg>

      {/* rotating dashed ring (native-driver transform, cheap) */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Circle
            cx="100"
            cy="100"
            r="68"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="2,6"
            fill="none"
            opacity={0.6}
          />
        </Svg>
      </Animated.View>

      {/* pulsing glow core (native-driver opacity, cheap) */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowOpacity }]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id="core" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <Stop offset="45%" stopColor={color} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={color} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="100" cy="100" r="24" fill="url(#core)" />
        </Svg>
      </Animated.View>
    </View>
  );
}
