// Bottom Sheet - Mobile Drawer Component
// Swipeable bottom sheet for mobile-friendly interactions

import React, { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/styles/party-design-tokens.css';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[]; // Heights as percentages (e.g., [50, 90])
  defaultSnapPoint?: number; // Index of default snap point
  showHandle?: boolean;
  showClose?: boolean;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [50, 90],
  defaultSnapPoint = 0,
  showHandle = true,
  showClose = true,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [currentHeight, setCurrentHeight] = useState(snapPoints[defaultSnapPoint]);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset height when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentHeight(snapPoints[defaultSnapPoint]);
    }
  }, [isOpen, snapPoints, defaultSnapPoint]);

  // Handle touch/mouse start
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(currentHeight);
  }, [currentHeight]);

  // Handle touch/mouse move
  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;

    const deltaY = startY - clientY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    let newHeight = startHeight + deltaPercent;

    // Constrain to min/max snap points with rubber band effect
    const minSnap = Math.min(...snapPoints);
    const maxSnap = Math.max(...snapPoints);

    if (newHeight < minSnap) {
      // Rubber band below min
      newHeight = minSnap - (minSnap - newHeight) * 0.3;
    } else if (newHeight > maxSnap) {
      // Rubber band above max
      newHeight = maxSnap + (newHeight - maxSnap) * 0.3;
    }

    setCurrentHeight(Math.max(0, newHeight));
  }, [isDragging, startY, startHeight, snapPoints]);

  // Handle touch/mouse end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // Find nearest snap point
    const minSnap = Math.min(...snapPoints);

    // Close if dragged below threshold
    if (currentHeight < minSnap - 15) {
      onClose();
      return;
    }

    // Snap to nearest point
    let nearestSnap = snapPoints[0];
    let minDistance = Math.abs(currentHeight - snapPoints[0]);

    for (const snap of snapPoints) {
      const distance = Math.abs(currentHeight - snap);
      if (distance < minDistance) {
        minDistance = distance;
        nearestSnap = snap;
      }
    }

    setCurrentHeight(nearestSnap);
  }, [isDragging, currentHeight, snapPoints, onClose]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse event handlers (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        style={{ opacity: Math.min(currentHeight / 100, 1) }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl',
          'flex flex-col',
          !isDragging && 'transition-all duration-300 ease-out',
          className
        )}
        style={{
          height: `${currentHeight}vh`,
          maxHeight: '95vh',
        }}
      >
        {/* Drag Handle Area */}
        <div
          className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          {showHandle && (
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
          )}
        </div>

        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            {showClose && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 safe-area-bottom">
          {children}
        </div>
      </div>
    </>
  );
}

// Simple confirmation bottom sheet
interface ConfirmSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
}

export function ConfirmSheet({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
}: ConfirmSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[40]}
      showClose={false}
    >
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-500">{message}</p>

        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              'w-full py-3.5 rounded-xl font-semibold transition-colors',
              confirmVariant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            )}
            style={{ minHeight: '48px' }} // 48px touch target
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
            style={{ minHeight: '48px' }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

// Action sheet (list of options)
interface ActionSheetOption {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
}

export function ActionSheet({
  isOpen,
  onClose,
  title,
  options,
}: ActionSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[35 + options.length * 8]}
      showHandle
      showClose={false}
    >
      {title && (
        <p className="text-sm text-gray-500 text-center mb-4">{title}</p>
      )}
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              option.onClick();
              onClose();
            }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-medium transition-colors',
              option.destructive
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-900 hover:bg-gray-100'
            )}
            style={{ minHeight: '48px' }}
          >
            {option.icon && <option.icon className="w-5 h-5" />}
            {option.label}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full mt-4 py-3.5 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
        style={{ minHeight: '48px' }}
      >
        Cancel
      </button>
    </BottomSheet>
  );
}

export default BottomSheet;
