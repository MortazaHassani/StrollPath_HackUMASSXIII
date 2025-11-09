import React from 'react';

const StepIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.375 2.25L9 4.875l-2.625 2.625M15.375 2.25L18 4.875l-2.625 2.625M6.375 11.25L9 13.875l-2.625 2.625M15.375 11.25L18 13.875l-2.625 2.625" transform="rotate(-45 12 12)"/>
    </svg>
);

export default StepIcon;
