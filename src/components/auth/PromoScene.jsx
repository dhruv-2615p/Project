import React from 'react';
import { Box } from '@mui/material';

const PromoScene = ({ mousePos = { x: 0, y: 0 } }) => (
  <Box className="promo-scene" sx={{ transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)`, transition: 'transform 0.4s ease-out' }}>
    {/* Large Orbs */}
    <Box className="promo-orb promo-orb-1" />
    <Box className="promo-orb promo-orb-2" />
    <Box className="promo-orb promo-orb-3" />

    {/* Rotating Cube */}
    <Box className="promo-cube">
      <Box className="promo-cube-face" />
      <Box className="promo-cube-face" />
      <Box className="promo-cube-face" />
      <Box className="promo-cube-face" />
    </Box>

    {/* Floating Ring */}
    <Box className="promo-ring" />

    {/* Pill Capsule */}
    <Box className="promo-pill" />

    {/* Diamond */}
    <Box className="promo-diamond" />

    {/* Constellation Dots */}
    <Box className="promo-dot promo-dot-1" />
    <Box className="promo-dot promo-dot-2" />
    <Box className="promo-dot promo-dot-3" />
    <Box className="promo-dot promo-dot-4" />

    {/* Connecting Lines */}
    <Box className="promo-line promo-line-1" />
    <Box className="promo-line promo-line-2" />
    <Box className="promo-line promo-line-3" />
  </Box>
);

export default PromoScene;
