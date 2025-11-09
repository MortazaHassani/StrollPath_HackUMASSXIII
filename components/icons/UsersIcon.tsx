import React from 'react';

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-1.063M15 19.128v-3.872M15 19.128l-3.262-3.262M9 19.128l-3.262-3.262m0 0a9.38 9.38 0 012.625-.372 9.337 9.337 0 014.121 1.063M3.262 15.866a9.38 9.38 0 012.625-.372M3.262 15.866l3.262 3.262M3.262 15.866a9.337 9.337 0 004.121 1.063M12 6a3 3 0 11-6 0 3 3 0 016 0zm-3 9a3 3 0 11-6 0 3 3 0 016 0zm6-3a3 3 0 116 0 3 3 0 01-6 0z" />
  </svg>
);

export default UsersIcon;