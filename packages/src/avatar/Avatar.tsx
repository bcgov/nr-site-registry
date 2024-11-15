import React from 'react';
import './Avatar.css';

// Define the types of props the Avatar component will accept
export interface AvatarProps {
  firstName?: string;   // Optional first name for the avatar (used to generate initials)
  lastName?: string;    // Optional last name for the avatar (used to generate initials)
  customImageCss?: string;  // Optional custom CSS class for the image container
  customTextCss?: string;   // Optional custom CSS class for the text (initials) inside the avatar
}

const Avatar: React.FC<AvatarProps> = ({
  firstName,
  lastName,
  customImageCss,
  customTextCss,
}) => {
  // Function to generate initials based on the first and last name
  const getInitials = (): string => {
    // If neither firstName nor lastName are provided, return a question mark
    if (!firstName && !lastName) return '?';
    
    // Get the first character of the first name (if it exists), and capitalize it
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    
    // Get the first character of the last name (if it exists), and capitalize it
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    
    // Return the initials combined (e.g., "JS" for "John Smith")
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <div
      // The container of the avatar, uses flexbox for alignment and custom CSS classes
      className={`d-flex align-items-center justify-content-center ${customImageCss ?? 'avatar-image'}`}
      aria-label="User profile image" // Accessibility label for the avatar
    >
      {/* Display the initials inside a span, applying custom text styles if provided */}
      <span className={`${customTextCss ?? 'avatar-txt'}`}>
        {getInitials() || '?'}  {/* Display the initials or fallback '?' */}
      </span>
    </div>
  );
};

// Default export of the Avatar component
export default Avatar;

// Named exports (commented out for now, but can be used if needed)
// export { Avatar };
