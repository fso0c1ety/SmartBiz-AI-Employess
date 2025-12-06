import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, Spacing } from '../constants/spacing';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
  noPadding?: boolean;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  style,
  colors = ['#2D6AFF', '#10B981'],
  noPadding = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.gradient,
          {
            backgroundColor: colors[0],
          },
        ]}
      >
        <View style={[styles.content, !noPadding && styles.contentPadding]}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    borderRadius: BorderRadius.lg,
  },
  content: {
    borderRadius: BorderRadius.lg,
  },
  contentPadding: {
    padding: Spacing.lg,
  },
});
