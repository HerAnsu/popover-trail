import { createContext } from 'react';

/**
 * Context container holding the current Popover card's unique key ID.
 * Used by `<PopoverTrigger>` components to detect if they are nested and resolve
 * their parent popover key automatically.
 */
export const PopoverCardContext = createContext<string | null>(null);
PopoverCardContext.displayName = 'PopoverCardContext';
