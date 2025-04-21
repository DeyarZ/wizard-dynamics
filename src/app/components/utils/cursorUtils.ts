"use client";

import { createContext, useContext } from 'react';

export type CursorType = 'default' | 'hover' | 'focus';

export interface CursorContextType {
  cursorType: CursorType;
  setCursorType: (type: CursorType) => void;
}

export const CursorContext = createContext<CursorContextType>({
  cursorType: 'default',
  setCursorType: () => {}
});

export const useCursor = () => useContext(CursorContext); 