import { motion } from "framer-motion";

// Welcome Illustration: Building with modern design
export function WelcomeIllustration() {
  return (
    <motion.svg
      width="240"
      height="240"
      viewBox="0 0 240 240"
      className="mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <linearGradient id="welcomeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle
        cx="120"
        cy="120"
        r="110"
        fill="url(#welcomeGrad)"
        opacity="0.08"
      />

      {/* Main building - modern style */}
      <motion.g
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Building base */}
        <rect
          x="60"
          y="80"
          width="120"
          height="100"
          rx="8"
          fill="url(#welcomeGrad)"
          opacity="0.85"
          filter="url(#shadow)"
        />

        {/* Roof */}
        <polygon
          points="60,80 120,40 180,80"
          fill="url(#welcomeGrad)"
          opacity="0.95"
        />

        {/* Windows grid - 4x3 */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <g key={`window-${row}-${col}`}>
              <rect
                x={72 + col * 28}
                y={95 + row * 22}
                width="18"
                height="18"
                rx="3"
                fill="#93C5FD"
                opacity="0.6"
              />
              <circle
                cx={81 + col * 28}
                cy={104 + row * 22}
                r="2"
                fill="#1E293B"
                opacity="0.2"
              />
            </g>
          ))
        )}

        {/* Door */}
        <rect
          x="105"
          y="155"
          width="30"
          height="35"
          rx="4"
          fill="#92400E"
          opacity="0.7"
        />
        <circle cx="130" cy="172.5" r="3" fill="#F59E0B" opacity="0.8" />

        {/* Entrance light */}
        <circle
          cx="120"
          cy="150"
          r="4"
          fill="#FDE047"
          opacity="0.7"
        />
      </motion.g>

      {/* Decorative element - arrow pointing up */}
      <motion.path
        d="M 120 200 L 120 215 M 115 210 L 120 215 L 125 210"
        stroke="url(#welcomeGrad)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.svg>
  );
}

// Profile Illustration: Person Avatar - Modern style
export function ProfileIllustration() {
  return (
    <motion.svg
      width="240"
      height="240"
      viewBox="0 0 240 240"
      className="mx-auto"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <linearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="shadowProfile">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="120" cy="120" r="110" fill="url(#profileGrad)" opacity="0.08" />

      <motion.g
        animate={{ rotate: [0, 2, 0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        {/* Head */}
        <circle cx="120" cy="80" r="38" fill="url(#profileGrad)" opacity="0.85" filter="url(#shadowProfile)" />

        {/* Body - shirt */}
        <rect x="80" y="125" width="80" height="60" rx="8" fill="url(#profileGrad)" opacity="0.9" filter="url(#shadowProfile)" />

        {/* Collar */}
        <polygon
          points="100,125 120,135 140,125"
          fill="url(#profileGrad)"
          opacity="0.95"
        />

        {/* Arms */}
        <ellipse cx="55" cy="145" rx="18" ry="28" fill="url(#profileGrad)" opacity="0.75" />
        <ellipse cx="185" cy="145" rx="18" ry="28" fill="url(#profileGrad)" opacity="0.75" />

        {/* Head details */}
        <circle cx="110" cy="75" r="4" fill="white" opacity="0.8" />
        <circle cx="130" cy="75" r="4" fill="white" opacity="0.8" />

        {/* Smile */}
        <path
          d="M 112 88 Q 120 92 128 88"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Accent line on shirt */}
        <line
          x1="100"
          y1="140"
          x2="100"
          y2="165"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.3"
        />
      </motion.g>
    </motion.svg>
  );
}

// Role Illustration: People Group - Team collaboration
export function RoleIllustration() {
  return (
    <motion.svg
      width="240"
      height="240"
      viewBox="0 0 240 240"
      className="mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <linearGradient id="role1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="role2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="role3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        <filter id="shadowRole">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="120" cy="120" r="110" fill="url(#role1)" opacity="0.08" />

      {/* Person 1 - Left */}
      <motion.g
        animate={{ x: [-8, 0, -8], y: [0, -4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity }}
      >
        <circle cx="65" cy="75" r="22" fill="url(#role1)" opacity="0.8" filter="url(#shadowRole)" />
        <rect x="45" y="105" width="40" height="50" rx="6" fill="url(#role1)" opacity="0.85" />
        <circle cx="60" cy="70" r="3" fill="white" opacity="0.7" />
        <circle cx="70" cy="70" r="3" fill="white" opacity="0.7" />
      </motion.g>

      {/* Person 2 - Center (taller) */}
      <motion.g
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
      >
        <circle cx="120" cy="65" r="26" fill="url(#role2)" opacity="0.9" filter="url(#shadowRole)" />
        <rect x="95" y="100" width="50" height="60" rx="6" fill="url(#role2)" opacity="0.95" />
        <circle cx="108" cy="60" r="3.5" fill="white" opacity="0.8" />
        <circle cx="132" cy="60" r="3.5" fill="white" opacity="0.8" />
      </motion.g>

      {/* Person 3 - Right */}
      <motion.g
        animate={{ x: [8, 0, 8], y: [0, -4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity }}
      >
        <circle cx="175" cy="75" r="22" fill="url(#role3)" opacity="0.8" filter="url(#shadowRole)" />
        <rect x="155" y="105" width="40" height="50" rx="6" fill="url(#role3)" opacity="0.85" />
        <circle cx="170" cy="70" r="3" fill="white" opacity="0.7" />
        <circle cx="180" cy="70" r="3" fill="white" opacity="0.7" />
      </motion.g>
    </motion.svg>
  );
}

// Situation Illustration: Charts/Analytics - Data visualization
export function SituationIllustration() {
  return (
    <motion.svg
      width="240"
      height="240"
      viewBox="0 0 240 240"
      className="mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <linearGradient id="chart1" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="chart2" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <filter id="shadowChart">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="120" cy="120" r="110" fill="url(#chart1)" opacity="0.08" />

      {/* Chart bars with animation */}
      <motion.rect
        x="50"
        y="120"
        width="28"
        height="70"
        rx="4"
        fill="url(#chart1)"
        opacity="0.75"
        animate={{ height: [50, 70, 60, 70] }}
        transition={{ duration: 3, repeat: Infinity }}
        filter="url(#shadowChart)"
      />
      <motion.rect
        x="90"
        y="100"
        width="28"
        height="90"
        rx="4"
        fill="url(#chart1)"
        opacity="0.85"
        animate={{ height: [70, 90, 80, 90] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
        filter="url(#shadowChart)"
      />
      <motion.rect
        x="130"
        y="80"
        width="28"
        height="110"
        rx="4"
        fill="url(#chart2)"
        opacity="0.9"
        animate={{ height: [90, 110, 100, 110] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
        filter="url(#shadowChart)"
      />
      <motion.rect
        x="170"
        y="110"
        width="28"
        height="80"
        rx="4"
        fill="url(#chart2)"
        opacity="0.8"
        animate={{ height: [60, 80, 70, 80] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
        filter="url(#shadowChart)"
      />

      {/* Baseline */}
      <line x1="40" y1="190" x2="210" y2="190" stroke="#D1D5DB" strokeWidth="2" />

      {/* Data points indicator */}
      <circle cx="64" cy="120" r="2.5" fill="white" opacity="0.5" />
      <circle cx="104" cy="100" r="2.5" fill="white" opacity="0.5" />
      <circle cx="144" cy="80" r="2.5" fill="white" opacity="0.5" />
      <circle cx="184" cy="110" r="2.5" fill="white" opacity="0.5" />
    </motion.svg>
  );
}

// Property Illustration: Building with detail - Modern architecture
export function PropertyIllustration() {
  return (
    <motion.svg
      width="240"
      height="240"
      viewBox="0 0 240 240"
      className="mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <linearGradient id="propGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="shadowProp">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="120" cy="120" r="110" fill="url(#propGrad)" opacity="0.08" />

      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        {/* Main building - detailed */}
        <rect
          x="55"
          y="60"
          width="130"
          height="110"
          rx="8"
          fill="url(#propGrad)"
          opacity="0.85"
          filter="url(#shadowProp)"
        />

        {/* Roof - peaked */}
        <polygon
          points="55,60 120,25 185,60"
          fill="url(#propGrad)"
          opacity="0.95"
        />

        {/* Windows - 4x3 grid with details */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <g key={`prop-window-${row}-${col}`}>
              <rect
                x={68 + col * 27}
                y={75 + row * 25}
                width="19"
                height="19"
                rx="3"
                fill="#93C5FD"
                opacity="0.6"
              />
              <line
                x1={77.5 + col * 27}
                y1={75 + row * 25}
                x2={77.5 + col * 27}
                y2={94 + row * 25}
                stroke="#1E293B"
                strokeWidth="0.5"
                opacity="0.3"
              />
              <line
                x1={68 + col * 27}
                y1={84.5 + row * 25}
                x2={87 + col * 27}
                y2={84.5 + row * 25}
                stroke="#1E293B"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </g>
          ))
        )}

        {/* Door */}
        <rect
          x="105"
          y="155"
          width="30"
          height="40"
          rx="4"
          fill="#92400E"
          opacity="0.7"
          filter="url(#shadowProp)"
        />
        <circle cx="130" cy="175" r="3.5" fill="#F59E0B" opacity="0.8" />

        {/* Door frame detail */}
        <rect
          x="105"
          y="155"
          width="30"
          height="40"
          rx="4"
          fill="none"
          stroke="white"
          strokeWidth="1"
          opacity="0.2"
        />

        {/* Entrance arch light */}
        <circle
          cx="120"
          cy="148"
          r="5"
          fill="#FCD34D"
          opacity="0.5"
        />
      </motion.g>
    </motion.svg>
  );
}

// Housing Illustration: Grid of apartments - Portfolio
export function HousingIllustration() {
  return (
    <motion.svg
      width="240"
      height="240"
      viewBox="0 0 240 240"
      className="mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <linearGradient id="housing1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="housing2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <filter id="shadowHousing">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="120" cy="120" r="110" fill="url(#housing1)" opacity="0.08" />

      {/* Apartment grid - 2x3 */}
      {[0, 1, 2].map((row) =>
        [0, 1].map((col) => (
          <motion.g
            key={`apt-${row}-${col}`}
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              delay: row * 0.15 + col * 0.1,
            }}
          >
            <rect
              x={50 + col * 70}
              y={50 + row * 55}
              width="55"
              height="50"
              rx="5"
              fill={col === 0 ? "url(#housing1)" : "url(#housing2)"}
              opacity={0.75 + col * 0.1}
              filter="url(#shadowHousing)"
            />

            {/* Windows - 2 windows per apartment */}
            <rect
              x={60 + col * 70}
              y={60 + row * 55}
              width="12"
              height="12"
              rx="2"
              fill="#93C5FD"
              opacity="0.6"
            />
            <rect
              x={80 + col * 70}
              y={60 + row * 55}
              width="12"
              height="12"
              rx="2"
              fill="#93C5FD"
              opacity="0.6"
            />

            {/* Door indicator */}
            <rect
              x={65 + col * 70}
              y={78 + row * 55}
              width="10"
              height="15"
              rx="2"
              fill="#92400E"
              opacity="0.6"
            />
          </motion.g>
        ))
      )}
    </motion.svg>
  );
}

// Complete Illustration: Success Checkmark with celebration
export function CompleteIllustration() {
  return (
    <motion.svg
      width="240"
      height="240"
      viewBox="0 0 240 240"
      className="mx-auto"
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.6 }}
    >
      <defs>
        <linearGradient id="completeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Confetti pieces */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.rect
          key={`confetti-${i}`}
          x={40 + (i % 3) * 50}
          y={30 - (Math.floor(i / 3) * 20)}
          width="10"
          height="10"
          rx="2"
          fill={
            ["#6366F1", "#A855F7", "#EC4899", "#10B981", "#FCD34D", "#F97316"][i]
          }
          animate={{
            y: [30 - (Math.floor(i / 3) * 20), 180],
            rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeIn",
          }}
        />
      ))}

      {/* Success circle - pulsing */}
      <motion.circle
        cx="120"
        cy="120"
        r="60"
        fill="url(#completeGrad)"
        opacity="0.15"
        animate={{ r: [55, 70, 55] as any }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Checkmark */}
      <motion.path
        d="M 95 120 L 110 135 L 155 90"
        stroke="url(#completeGrad)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        filter="url(#glow)"
      />

      {/* Circle outline */}
      <motion.circle
        cx="120"
        cy="120"
        r="50"
        fill="none"
        stroke="url(#completeGrad)"
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />
    </motion.svg>
  );
}
