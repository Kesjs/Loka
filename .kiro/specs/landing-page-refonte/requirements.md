# Requirements Document: Landing Page Refonte

## Introduction

The Loka landing page requires a professional redesign to establish clear information hierarchy, improve user experience, and streamline the signup journey. This refonte focuses on three core areas: modernizing the navigation with professional terminology, reorganizing the footer into a 5-column layout with a dedicated Support section, and enhancing the FAQ section with improved spacing for better visual breathing room. All changes must maintain direct signup flows without modal dialogs and ensure both desktop and mobile responsiveness.

## Glossary

- **Landing Page**: The public-facing homepage of the Loka application at `app/page.tsx`
- **Navigation Bar**: The fixed header containing logo, navigation links, and authentication buttons
- **Professional Navigation**: Standard French business terminology for menu items (Fonctionnalités, Tarifs, À propos, Contact)
- **Footer**: The page footer containing company information and legal links
- **5-Column Layout**: Footer reorganized into five distinct sections: Produit, Support, Entreprise, Légal, Contact
- **FAQ Section**: Frequently Asked Questions accordion component with expandable items
- **CTA Button**: Call-to-action button directing users to signup or login pages
- **Direct Signup Flow**: Registration process triggered by direct navigation to `/login?tab=signup` without intermediate modal dialogs
- **Portal Locataire**: Tenant portal showcase section displaying payment and document management features
- **Responsive Design**: Layout that adapts seamlessly to mobile (< 768px), tablet (768px-1024px), and desktop (> 1024px) viewports

## Requirements

### Requirement 1: Professional Navigation Structure

**User Story:** As a visitor to the Loka landing page, I want to find professional and clear navigation labels so that I can quickly understand the platform's key offerings and company information.

#### Acceptance Criteria

1. WHEN the landing page loads on desktop, THE Navigation SHALL display four professional items in this order: Fonctionnalités, Tarifs, À propos, Contact
2. THE Navigation SHALL use standard French business terminology consistent with Loka's target market of Beninese property owners and agencies
3. WHEN the user scrolls past 12px on the Y-axis, THE Navigation Bar SHALL add a shadow effect to improve visual separation
4. WHEN the user clicks a navigation link, THE Page SHALL smoothly scroll to the corresponding section and close any open mobile menu
5. WHILE the mobile menu is open, THE Navigation SHALL display the same four items as clickable links with adequate spacing (min-height: 44px)
6. THE Navigation Bar SHALL always display both Connexion and Commencer gratuitement links on desktop (hidden on mobile until mobile menu opens)

### Requirement 2: Improved FAQ Spacing and Layout

**User Story:** As a user reading the FAQ section, I want adequate spacing between questions and answers so that the content feels less cramped and more readable.

#### Acceptance Criteria

1. WHEN the FAQ section is displayed, THE Gap between FAQ items SHALL be increased to provide visual breathing room (gap: 24px or greater)
2. THE FAQ item row SHALL have minimum height of 64px when closed to improve click target size and visual hierarchy
3. WHEN a FAQ item is expanded, THE Answer text SHALL have bottom padding of at least 24px before the next item appears
4. WHILE the user reads an answer, THE Answer text container SHALL use line-height of 1.75 or greater for optimal readability
5. THE FAQ Button (expand/collapse) SHALL maintain focus-visible outline styling (2px offset, primary-800 color) for keyboard accessibility

### Requirement 3: Footer Reorganization - 5-Column Layout

**User Story:** As a visitor reviewing footer information, I want a clear, organized footer with dedicated sections so that I can quickly find product information, support resources, company details, legal documents, and contact information.

#### Acceptance Criteria

1. WHEN the footer is displayed on desktop, THE Footer SHALL contain exactly 5 columns with these titles: Produit, Support, Entreprise, Légal, Contact
2. THE Produit column SHALL include links: Fonctionnalités, Tarifs, Portail locataire
3. THE Support column SHALL be a new dedicated section including links: FAQ, Contact & support
4. THE Entreprise column SHALL include links: À propos, Blog (if available), Careers (if available)
5. THE Légal column SHALL include links: CGU & mentions légales, Confidentialité
6. THE Contact column SHALL include company contact information and social media links (where applicable)
7. WHILE the viewport is smaller than 768px, THE Footer columns SHALL stack vertically with clear section headers maintaining the 5-column structure when collapsed
8. THE Footer SHALL maintain adequate spacing between columns (gap: 32px or greater on desktop, 24px on tablet)

### Requirement 4: CTA Button Functionality and Signup Flow

**User Story:** As a potential user, I want all call-to-action buttons to direct me to a functioning signup or login page so that I can quickly begin my free trial or log in.

#### Acceptance Criteria

1. WHEN the user clicks Commencer gratuitement or Essai gratuit 14 jours buttons, THE Browser SHALL navigate to `/login?tab=signup` with no modal dialogs
2. WHEN the user clicks Connexion link, THE Browser SHALL navigate to `/login` with no modal dialogs
3. WHEN the signup page loads from a landing page CTA, THE Page SHALL display the signup form immediately without requiring additional navigation
4. THE CTA buttons SHALL have appropriate visual states: default (primary-800), hover (primary-900), focus-visible (2px offset outline)

### Requirement 5: Navigation Link Consistency and Branding

**User Story:** As a returning visitor, I want consistent navigation terminology and branding so that the landing page feels professional and easy to navigate.

#### Acceptance Criteria

1. WHEN the user views the navigation on any device, THE Navigation link labels SHALL remain consistent with the professional terminology: Fonctionnalités, Tarifs, À propos, Contact
2. THE Logo link SHALL always navigate to the landing page home section (#accueil) and reset mobile menu state
3. WHEN the user hovers over a navigation link, THE Link text color SHALL transition to primary-800 with smooth animation (transition-colors)
4. THE Navigation Bar positioning SHALL remain fixed at the top with z-index: 60 to ensure it stays above all content except the progress bar (z-index: 70)

### Requirement 6: Mobile Menu Accessibility and User Experience

**User Story:** As a mobile user, I want a functional mobile menu that provides easy access to all navigation and authentication options.

#### Acceptance Criteria

1. WHEN the user clicks the menu toggle button on mobile, THE Mobile menu SHALL open with animation (opacity and height transitions)
2. WHEN the mobile menu is open, THE Body overflow SHALL be hidden to prevent background scrolling
3. WHEN the user presses Escape key, THE Mobile menu SHALL close automatically
4. WHEN the user clicks a navigation link in the mobile menu, THE Mobile menu SHALL close and navigation shall occur
5. THE Mobile menu buttons SHALL display both Connexion and Commencer gratuitement options with appropriate styling
6. WHILE the mobile menu is displayed on small screens, THE Menu items SHALL be full-width or near-full-width for easier touch targets

### Requirement 7: Portal Locataire Section Integration

**User Story:** As a prospective user, I want to understand the tenant portal features through clear visual examples so that I can see the value proposition before signing up.

#### Acceptance Criteria

1. WHEN the user clicks Voir le portail locataire or Tester le portail buttons, THE Page SHALL scroll smoothly to the Portal Locataire section (id: portail-locataire)
2. WHILE viewing the feature stories, THE Story artifact cards SHALL display relevant visuals (payment confirmation, receipt, agency dashboard, or tenant space)
3. THE Story cards SHALL animate on scroll with staggered reveal animation for visual engagement
4. WHEN the user hovers over artifact cards on desktop, THE Cards SHALL animate upward (y: -5) for interactive feedback

### Requirement 8: Responsive Design Consistency

**User Story:** As a user on any device, I want the landing page to render correctly and maintain usability across desktop, tablet, and mobile viewports.

#### Acceptance Criteria

1. WHEN the page loads on mobile (< 768px), THE Layout SHALL stack vertically with appropriate padding (px-5 or px-6)
2. WHEN the viewport is tablet size (768px - 1024px), THE Layout SHALL use intermediate spacing and component sizes
3. WHEN the viewport is desktop size (> 1024px), THE Layout SHALL use full-width columns and enhanced spacing (gap: 20px or greater)
4. THE All text sizes SHALL use responsive units (text-sm, text-base, text-lg, etc.) or clamp() function for smooth scaling
5. WHILE the page is displayed on any device, THE Focus-visible outlines SHALL remain visible with 2px offset and primary-800 color for keyboard navigation

---

## Quality Standards Applied

All requirements follow EARS patterns and comply with INCOSE quality rules:
- Each requirement uses exactly one EARS pattern (Ubiquitous, Event-driven, State-driven, Unwanted event, Optional, or Complex)
- All system components are defined in the Glossary
- Requirements use active voice and avoid vague terminology
- Conditions are measurable and testable
- No escape clauses, absolutes, or negative statements (except where necessary for error handling)
