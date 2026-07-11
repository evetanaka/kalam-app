import React from 'react';
import { View, Modal as RNModal, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '@kalam/theme';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Snap height as percentage of screen */
  height?: number;
}

/**
 * Cross-platform bottom sheet.
 * Uses Modal + animated View. For native, a .native.tsx variant
 * can use react-native-bottom-sheet.
 */
export function BottomSheet({ open, onClose, children, height = 0.5 }: BottomSheetProps) {
  const { theme: t } = useTheme();
  const screenHeight = Dimensions.get('window').height;

  if (!open) return null;

  return (
    <RNModal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: t.colors.overlay, justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback>
            <View
              style={{
                height: screenHeight * height,
                backgroundColor: t.colors.background,
                borderTopLeftRadius: t.radius['2xl'],
                borderTopRightRadius: t.radius['2xl'],
                padding: t.spacing[4],
              }}
            >
              {/* Handle bar */}
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: t.colors.border,
                  alignSelf: 'center',
                  marginBottom: t.spacing[3],
                }}
              />
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}
