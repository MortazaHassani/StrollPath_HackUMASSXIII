import React from 'react';

// SVG representation of the Stroll Path logo, using a color similar to Tailwind's amber-500.
const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 280 70" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <style>
        {`
          .stroll-path-text {
            font-family: 'Inter', sans-serif;
            font-size: 40px;
            font-weight: 700;
            fill: #F59E0B; /* amber-500 */
            letter-spacing: -0.5px;
          }
          .stroll-path-swoosh {
            fill: none;
            stroke: #F59E0B; /* amber-500 */
            stroke-width: 4;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
        `}
      </style>
    </defs>
    <text x="140" y="38" textAnchor="middle" className="stroll-path-text">Stroll Path</text>
    <path d="M30 50 Q 140 70, 250 50" className="stroll-path-swoosh" />
  </svg>
);


export default Logo;