import React, { useEffect, useRef } from 'react';\nimport { View, Animated, Easing, StyleSheet } from 'react-native';\nimport Svg, { Circle, G, Line, Rect, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

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
export default function Reactor({ size = 200, color = '#3ce8c9', coilCount = 9 }) {
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

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
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

  // --- top cover badge (arc-reactor emblem, scaled to sit inside the tick ring) ---
  const cv = (r) => r * 0.4;

  function arcBandPath(centerDeg, halfspan, rIn, rOut, steps = 16) {
    const outer = Array.from({ length: steps + 1 }).map((_, i) => pt(rOut, centerDeg - halfspan + (2 * halfspan * i) / steps));
    const inner = Array.from({ length: steps + 1 }).map((_, i) => pt(rIn, centerDeg + halfspan - (2 * halfspan * i) / steps));
    const pts = outer.concat(inner);
    return 'M ' + pts.map((p) => p.join(',')).join(' L ') + ' Z';
  }
  function triInterlacePath(points, overshoot) {
    let d = '';
    points.forEach((p1, i) => {
      const p2 = points[(i + 1) % points.length];
      const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
      const len = Math.hypot(dx, dy);
      const ex = p2[0] + (dx / len) * overshoot, ey = p2[1] + (dy / len) * overshoot;
      d += `M ${p1[0]} ${p1[1]} L ${ex} ${ey} `;
    });
    return d;
  }

  const coverPetalDefs = [
    { a: 270, span: 25, rIn: cv(80), rOut: cv(96) },
    { a: 30, span: 25, rIn: cv(80), rOut: cv(96) },
    { a: 150, span: 25, rIn: cv(80), rOut: cv(96) },
    { a: 210, span: 16, rIn: cv(87), rOut: cv(96) },
    { a: 330, span: 16, rIn: cv(87), rOut: cv(96) },
  ];
  const coverPetals = coverPetalDefs.map((p, i) => (
    <Path key={i} d={arcBandPath(p.a, p.span, p.rIn, p.rOut)} fill="none" stroke={color} strokeWidth={0.9} opacity={0.9} />
  ));

  const coverRouter = cv(72), coverRinner = cv(40);
  const coverOuterTri = [90, 210, 330].map((a) => pt(coverRouter, a));
  const coverInnerTri = [90, 210, 330].map((a) => pt(coverRinner, a));

  const coverFacets = [210, 330].map((a) => {
    const pTri = pt(coverRouter, a), pOut = pt(cv(87), a);
    return <Line key={a} x1={pTri[0]} y1={pTri[1]} x2={pOut[0]} y2={pOut[1]} stroke={color} strokeWidth={0.9} opacity={0.9} />;
  });
  const coverTopL = pt(coverRouter, 210), coverTopR = pt(coverRouter, 330);
  const coverApex = pt(coverRouter, 90);
  const coverTipOut = pt(cv(100), 90);

  // small circuit-trace fillers in the 6 empty gaps between petals
  const coverGapAngles = [240, 300, 0, 60, 120, 180];
  const coverGapTraces = coverGapAngles.map((a, i) => {
    const p0 = pt(cv(46), a), p1 = pt(cv(62), a), p2 = pt(cv(78), a + (i % 2 === 0 ? 8 : -8));
    return (
      <G key={a}>
        <Path d={`M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}`} stroke={color} strokeWidth={0.4} opacity={0.55} fill="none" />
        <Circle cx={p1[0]} cy={p1[1]} r={0.5} fill={color} opacity={0.6} />
        <Circle cx={p2[0]} cy={p2[1]} r={0.6} fill={color} opacity={0.65} />
      </G>
    );
  });

  // --- radial tick ring: short spokes facing the same way as the coils, not a dashed circle ---
  const tickCount = 48;
  const tickAngleStep = 360 / tickCount;
  const ticks = Array.from({ length: tickCount }).map((_, i) => (
    <G key={i} rotation={tickAngleStep * i} origin="100, 100">
      <Line x1={100 + 41} y1={100} x2={100 + 52} y2={100} stroke={color} strokeWidth={1.8} opacity={0.85} />
    </G>
  ));

  return (
    <View style={{ width: size, height: size }}>
      {/* static: rim, coils, circuit traces */}
      <Svg width={size} height={size} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
        <Circle cx="100" cy="100" r="94" stroke={color} strokeWidth="3.5" fill="none" opacity={0.45} />
        <G>{coils}</G>
        <G>{traces}</G>
      </Svg>

      {/* rotating radial tick ring (native-driver transform, cheap) */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <G>{ticks}</G>
        </Svg>
      </Animated.View>

      {/* static: top cover badge (petals + interlaced triangle + gap traces) */}
      <Svg width={size} height={size} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
        <G>{coverPetals}</G>
        <Path d={triInterlacePath(coverOuterTri, cv(7))} fill="none" stroke={color} strokeWidth={1} opacity={0.95} />
        <Path d={triInterlacePath(coverInnerTri, cv(4))} fill="none" stroke={color} strokeWidth={0.7} opacity={0.75} />
        <G>{coverFacets}</G>
        <Line x1={coverTopL[0]} y1={coverTopL[1]} x2={coverTopR[0]} y2={coverTopR[1]} stroke={color} strokeWidth={0.9} opacity={0.9} />
        <Line x1={coverApex[0]} y1={coverApex[1]} x2={coverTipOut[0]} y2={coverTipOut[1]} stroke={color} strokeWidth={0.9} opacity={0.9} />
        <G>{coverGapTraces}</G>
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
