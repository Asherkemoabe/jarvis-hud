import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, G, Line, Rect, Polygon, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

function pt(r, deg) {
  const a = (deg * Math.PI) / 180;
  return [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
}

// Real arc-reactor construction, ported from the reference images:
// - 9 wound coils (mounting clip + copper body + wire texture + highlight,
//   not just plain bars) evenly spaced every 40°
// - A rotating dashed containment ring
// - A petal-ring badge + interlocking faceted triangle (from the circular
//   badge reference) as the core emblem
// - Radiating circuit traces with via-nodes (from the triangle/traces
//   reference), adapted to a full circle
// - A white-hot pulsing glow at the center
// Only the dashed ring (transform) and the glow (opacity) animate — every
// other piece above is static geometry, painted once, so this stays cheap
// on low-end Android regardless of how much detail it has.
export default function Reactor({ size = 220, color = '#3ce8c9', coilCount = 9 }) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1250, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1250, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    spinLoop.start();
    pulseLoop.start();
    return () => { spinLoop.stop(); pulseLoop.stop(); };
  }, [spin, pulse]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  // --- coils: real component shape, evenly spaced, not plain poles ---
  const innerR = 56, outerR = 94, halfW = 6;
  const coilAngleStep = 360 / coilCount;
  const coils = Array.from({ length: coilCount }).map((_, i) => {
    const angle = coilAngleStep * i;
    const texture = Array.from({ length: 6 }).map((__, t) => {
      const xx = 100 + innerR + 8 + t * ((outerR - innerR - 14) / 5);
      return <Line key={t} x1={xx} y1={100 - halfW + 1} x2={xx} y2={100 + halfW - 1} stroke="#8a5a34" strokeWidth={0.8} />;
    });
    return (
      <G key={i} rotation={angle} origin="100, 100">
        <Rect x={100 + innerR - 4} y={100 - halfW - 1.5} width={8} height={(halfW + 1.5) * 2} rx={2} fill="#12181c" stroke={color} strokeWidth={0.3} strokeOpacity={0.3} />
        <Rect x={100 + innerR + 3} y={100 - halfW} width={outerR - innerR - 6} height={halfW * 2} rx={2} fill="#c87f4a" stroke="#3d2712" strokeWidth={0.4} />
        {texture}
        <Rect x={100 + innerR + 3} y={100 - halfW} width={outerR - innerR - 6} height={1.5} fill="#ffe3b0" opacity={0.5} />
      </G>
    );
  });

  // --- circuit traces, radiating from the core badge toward the coil ring ---
  const traceCount = 8;
  const traces = Array.from({ length: traceCount }).map((_, i) => {
    const ang = i * 45 + 22.5;
    const bendAng = ang + (i % 2 === 0 ? 12 : -12);
    const p0 = pt(27, ang), p1 = pt(43, ang), p2 = pt(57, bendAng);
    const midAng = ang + (bendAng - ang) * 0.5;
    const branchBase = pt(49, midAng);
    const perp = ((midAng + 90) * Math.PI) / 180;
    const stub = [branchBase[0] + 4.5 * Math.cos(perp), branchBase[1] + 4.5 * Math.sin(perp)];
    return (
      <G key={i}>
        <Path d={`M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}`} stroke={color} strokeWidth={0.45} opacity={0.5} fill="none" />
        <Circle cx={p1[0]} cy={p1[1]} r={0.8} fill={color} opacity={0.65} />
        <Circle cx={p2[0]} cy={p2[1]} r={1} fill={color} opacity={0.75} />
        <Line x1={branchBase[0]} y1={branchBase[1]} x2={stub[0]} y2={stub[1]} stroke={color} strokeWidth={0.35} opacity={0.4} />
        <Circle cx={stub[0]} cy={stub[1]} r={0.6} fill={color} opacity={0.55} />
      </G>
    );
  });

  // --- petal-ring badge (from the circular reference image) ---
  const petals = Array.from({ length: 6 }).map((_, b) => {
    const start = b * 60 + 6, end = b * 60 + 54, r1 = 15, r2 = 23;
    const a1 = pt(r1, start), a2 = pt(r2, start), a3 = pt(r2, end), a4 = pt(r1, end);
    const d = `M ${a1[0]} ${a1[1]} L ${a2[0]} ${a2[1]} A ${r2} ${r2} 0 0 1 ${a3[0]} ${a3[1]} L ${a4[0]} ${a4[1]} A ${r1} ${r1} 0 0 0 ${a1[0]} ${a1[1]} Z`;
    return <Path key={b} d={d} fill="none" stroke={color} strokeWidth={0.9} opacity={0.9} />;
  });

  // --- interlocking faceted triangle (from the triangle reference image) ---
  const triOuter = [90, 210, 330].map((a) => pt(13.5, a));
  const triInner = [90, 210, 330].map((a) => pt(7.5, a));
  const triOuterPts = triOuter.map((p) => p.join(',')).join(' ');
  const triInnerPts = triInner.map((p) => p.join(',')).join(' ');
  const struts = triOuter.map((p, k) => (
    <Line key={k} x1={p[0]} y1={p[1]} x2={triInner[k][0]} y2={triInner[k][1]} stroke={color} strokeWidth={0.5} opacity={0.6} />
  ));

  return (
    <View style={{ width: size, height: size }}>
      {/* static: rim, coils, circuit traces */}
      <Svg width={size} height={size} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
        <Circle cx="100" cy="100" r="96" stroke={color} strokeWidth="0.8" fill="none" opacity={0.4} />
        <G>{coils}</G>
        <G>{traces}</G>
      </Svg>

      {/* rotating dashed containment ring (native-driver transform, cheap) */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Circle cx="100" cy="100" r="68" stroke={color} strokeWidth="1" strokeDasharray="2,6" fill="none" opacity={0.6} />
        </Svg>
      </Animated.View>

      {/* static: petal badge + faceted triangle core emblem */}
      <Svg width={size} height={size} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
        <G>{petals}</G>
        <Polygon points={triOuterPts} fill="none" stroke={color} strokeWidth={0.9} opacity={0.95} />
        <Polygon points={triInnerPts} fill="none" stroke={color} strokeWidth={0.55} opacity={0.7} />
        <G>{struts}</G>
        <Circle cx="100" cy="100" r="2" fill="#ffffff" opacity={0.9} />
      </Svg>

      {/* pulsing white-hot glow (native-driver opacity, cheap) */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowOpacity }]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id="core" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <Stop offset="45%" stopColor={color} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={color} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="100" cy="100" r="12" fill="url(#core)" />
        </Svg>
      </Animated.View>
    </View>
  );
}
