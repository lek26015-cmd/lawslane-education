import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  duotone?: boolean;
}

export function FatLightning({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M13 2.5L4.5 13.5H11.5L10 21.5L19.5 10.5H12.5L13 2.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.25 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FatSchool({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M3 9.5L12 4L21 9.5V11H3V9.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.28 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4"
        y="11"
        width="16"
        height="9.5"
        rx="2"
        fill="currentColor"
        fillOpacity={duotone ? 0.15 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M10 20.5V15.5C10 14.67 10.67 14 11.5 14H12.5C13.33 14 14 14.67 14 15.5V20.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function FatUsers({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle
        cx="9"
        cy="7.5"
        r="4"
        fill="currentColor"
        fillOpacity={duotone ? 0.25 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M3 19.5C3 16 5.8 13.8 9 13.8C12.2 13.8 15 16 15 19.5"
        fill="currentColor"
        fillOpacity={duotone ? 0.2 : 0}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M16 4C17.7 4.5 18.8 6.1 18.8 8C18.8 9.9 17.7 11.5 16 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M17.5 14C19.5 14.8 21 16.5 21 19.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FatTrophy({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M7 4.5H17V10.5C17 13.3 14.8 15.5 12 15.5C9.2 15.5 7 13.3 7 10.5V4.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.28 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 6.5H4.5C3.7 6.5 3 7.2 3 8C3 10 4.5 11.5 6.5 11.5H7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 6.5H19.5C20.3 6.5 21 7.2 21 8C21 10 19.5 11.5 17.5 11.5H17"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.5V19M8 20.5H16"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="9" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function FatShieldCheck({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 2.5L4 5.5V11.5C4 16.5 7.5 20.8 12 22C16.5 20.8 20 16.5 20 11.5V5.5L12 2.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.25 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 11.8L11 14.3L15.5 9.8"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FatCap({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M2.5 9.5L12 4.5L21.5 9.5L12 14.5L2.5 9.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.3 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 11.8V16.5C6 18.2 8.7 20 12 20C15.3 20 18 18.2 18 16.5V11.8"
        fill="currentColor"
        fillOpacity={duotone ? 0.18 : 0}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M21.5 9.5V16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="21.5" cy="17.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function FatDiamond({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M6 3.5H18L21.5 8.5L12 21L2.5 8.5L6 3.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.25 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.8 8.5H21.2M7.5 8.5L12 20.5L16.5 8.5M6 3.5L8.5 8.5L12 3.5L15.5 8.5L18 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FatExam({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect
        x="4.5"
        y="4"
        width="15"
        height="17"
        rx="3"
        fill="currentColor"
        fillOpacity={duotone ? 0.2 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M8.5 2.8H15.5"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M8 9.5H13M8 13.5H16M8 17H12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function FatCard({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        fill="currentColor"
        fillOpacity={duotone ? 0.2 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M3 10H21"
        stroke="currentColor"
        strokeWidth="2.8"
      />
      <rect
        x="6"
        y="13.5"
        width="4.5"
        height="3"
        rx="1"
        fill="currentColor"
      />
    </svg>
  );
}

export function FatChart({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect
        x="3.5"
        y="13"
        width="4"
        height="7.5"
        rx="1.5"
        fill="currentColor"
        fillOpacity={duotone ? 0.25 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect
        x="10"
        y="8.5"
        width="4"
        height="12"
        rx="1.5"
        fill="currentColor"
        fillOpacity={duotone ? 0.35 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect
        x="16.5"
        y="4"
        width="4"
        height="16.5"
        rx="1.5"
        fill="currentColor"
        fillOpacity={duotone ? 0.5 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export function FatRocket({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M14.5 3C14.5 3 20.5 3.5 21 9C21.5 14.5 16 16.5 16 16.5L12 12.5L7.5 17C7 16 6.5 13 8 11.5L12.5 7L14.5 3Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.28 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15.5" cy="8.5" r="1.8" fill="currentColor" />
      <path
        d="M4.5 19.5C5.5 19.5 7.5 18 7.5 18L6 16.5C6 16.5 4.5 18.5 4.5 19.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function FatBackpack({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M9 5.5C9 3.5 10.3 2.5 12 2.5C13.7 2.5 15 3.5 15 5.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="5.5"
        width="14"
        height="15.5"
        rx="4"
        fill="currentColor"
        fillOpacity={duotone ? 0.25 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect
        x="7.5"
        y="12"
        width="9"
        height="6"
        rx="2"
        fill="currentColor"
        fillOpacity={duotone ? 0.35 : 1}
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M5 10H19"
        stroke="currentColor"
        strokeWidth="2.2"
      />
    </svg>
  );
}

export function FatStar({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 2.5L14.9 8.7L21.7 9.6L16.7 14.3L18 21L12 17.7L6 21L7.3 14.3L2.3 9.6L9.1 8.7L12 2.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.3 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FatBook({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M4.5 5.5C4.5 4.4 5.4 3.5 6.5 3.5H19.5V19H6.5C5.4 19 4.5 18.1 4.5 17V5.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.25 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 17C4.5 15.9 5.4 15 6.5 15H19.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="9.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function FatCheckCircle({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity={duotone ? 0.22 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M8.5 12L11 14.5L16 9.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FatMedal({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle
        cx="12"
        cy="14.5"
        r="6.5"
        fill="currentColor"
        fillOpacity={duotone ? 0.28 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M8 3.5L10 9M16 3.5L14 9M12 12.5V16.5M10 14.5H14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FatLaptop({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect
        x="4.5"
        y="5"
        width="15"
        height="11"
        rx="2"
        fill="currentColor"
        fillOpacity={duotone ? 0.22 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M2.5 18.5H21.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M9.5 9.5L8 11L9.5 12.5M14.5 9.5L16 11L14.5 12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FatPulse({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity={duotone ? 0.2 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M6 12H9L10.5 8.5L13.5 15.5L15 12H18"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FatSparkle({ size = 24, className = '', duotone = false, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FatFile({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M5 4.5C5 3.4 5.9 2.5 7 2.5H14L19 7.5V19.5C19 20.6 18.1 21.5 17 21.5H7C5.9 21.5 5 20.6 5 19.5V4.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.22 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2.5V7.5H19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 13H15M9 16.5H13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FatFolder({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M3.5 7.5C3.5 6.4 4.4 5.5 5.5 5.5H9.5L12 8H18.5C19.6 8 20.5 8.9 20.5 10V18.5C20.5 19.6 19.6 20.5 18.5 20.5H5.5C4.4 20.5 3.5 19.6 3.5 18.5V7.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.25 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FatLink({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M10 13.5C10.7 14.4 11.8 15 13 15H16C18.2 15 20 13.2 20 11C20 8.8 18.2 7 16 7H13C11.8 7 10.7 7.6 10 8.5M14 10.5C13.3 9.6 12.2 9 11 9H8C5.8 9 4 10.8 4 13C4 15.2 5.8 17 8 17H11C12.2 17 13.3 16.4 14 15.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FatLock({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect
        x="4.5"
        y="10"
        width="15"
        height="11"
        rx="3"
        fill="currentColor"
        fillOpacity={duotone ? 0.25 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M8 10V6.5C8 4.6 9.8 3 12 3C14.2 3 16 4.6 16 6.5V10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function FatEye({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M2.5 12C4.5 7.5 8 4.5 12 4.5C16 4.5 19.5 7.5 21.5 12C19.5 16.5 16 19.5 12 19.5C8 19.5 4.5 16.5 2.5 12Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.22 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.5" fill="currentColor" />
    </svg>
  );
}

export function FatCalendar({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15.5"
        rx="3"
        fill="currentColor"
        fillOpacity={duotone ? 0.2 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M3.5 10H20.5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M8 3V6M16 3V6"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="8" cy="14.5" r="1.2" fill="currentColor" />
      <circle cx="12" cy="14.5" r="1.2" fill="currentColor" />
      <circle cx="16" cy="14.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function FatTrash({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M4.5 6.5H19.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M10 3.5H14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M6 6.5L7.2 18.5C7.3 19.6 8.3 20.5 9.4 20.5H14.6C15.7 20.5 16.7 19.6 16.8 18.5L18 6.5"
        fill="currentColor"
        fillOpacity={duotone ? 0.22 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11V16M14 11V16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FatPin({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 2.5C9.5 2.5 7.5 4.5 7.5 7C7.5 10.5 12 17 12 17C12 17 16.5 10.5 16.5 7C16.5 4.5 14.5 2.5 12 2.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.25 : 1}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="7" r="2" fill="currentColor" />
      <path
        d="M12 17V21.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Mascot Signature Symbols (ซิมโบที่ล้อไปกับมาสคอต Wittaya) ──────

export function MascotMortarboard({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Mortarboard Diamond Top */}
      <path
        d="M12 3L2 8L12 13L22 8L12 3Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.28 : 1}
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cap Skull Base */}
      <path
        d="M6.5 10.5V15.5C6.5 15.5 8.5 18 12 18C15.5 18 17.5 15.5 17.5 15.5V10.5"
        fill="currentColor"
        fillOpacity={duotone ? 0.15 : 1}
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tassel Hanging Down with Mascot Gold Bead */}
      <path
        d="M20 9.5V16.5M20 17.5C19.2 17.5 18.5 18.2 18.5 19C18.5 19.8 19.2 20.5 20 20.5C20.8 20.5 21.5 19.8 21.5 19C21.5 18.2 20.8 17.5 20 17.5Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cute Little Center Dot */}
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function MascotInspectionStamp({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Magnifying Glass Outer Rim */}
      <circle
        cx="10.5"
        cy="10.5"
        r="7"
        fill="currentColor"
        fillOpacity={duotone ? 0.2 : 1}
        stroke="currentColor"
        strokeWidth="2.4"
      />
      {/* Verified Sparkle inside lens */}
      <path
        d="M8.5 10.5L10 12L13 9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Thick Handle */}
      <path
        d="M15.5 15.5L20.5 20.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Sparkle ✦ */}
      <path
        d="M18.5 4.5L19.2 6.2L21 7L19.2 7.8L18.5 9.5L17.8 7.8L16 7L17.8 6.2L18.5 4.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MascotKnowledgeBook({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M4.5 19.5V5.5C4.5 4.4 5.4 3.5 6.5 3.5H19.5V18C19.5 18 16.5 17.5 12 17.5C7.5 17.5 4.5 19.5 4.5 19.5Z"
        fill="currentColor"
        fillOpacity={duotone ? 0.22 : 1}
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 19.5C4.5 19.5 7.5 18 12 18C16.5 18 19.5 19.5 19.5 19.5M4.5 19.5C4.5 20.6 5.4 21.5 6.5 21.5H19.5V19.5"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Book Bookmark Ribbon */}
      <path
        d="M12 3.5V11L14 9.5L16 11V3.5"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MascotStarCluster({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Big 4-point Diamond Star */}
      <path
        d="M12 2C12 6.5 16 10 20.5 10C16 10 12 13.5 12 18C12 13.5 8 10 3.5 10C8 10 12 6.5 12 2Z"
        fill="currentColor"
      />
      {/* Small Secondary Star */}
      <path
        d="M18.5 15.5C18.5 17 20 18 21.5 18C20 18 18.5 19 18.5 20.5C18.5 19 17 18 15.5 18C17 18 18.5 17 18.5 15.5Z"
        fill="currentColor"
        opacity="0.75"
      />
      {/* Mini Tiny Star */}
      <circle cx="6" cy="18" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function MascotWingsEmblem({ size = 24, className = '', duotone = true, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Wittaya 'W' Mascot Body Form */}
      <path
        d="M4 6.5L8.5 18.5L12 11.5L15.5 18.5L20 6.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mini Graduation Cap on Top */}
      <path
        d="M12 2L8 4.5L12 7L16 4.5L12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}


