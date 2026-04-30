import React from 'react';
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onSkip: () => void;
};

export default function NudgeModal({ visible, onConfirm, onSkip }: Props) {
  const { theme } = useTheme();
  const handleDisable = async () => {
    try {
      await Linking.openSettings();
    } finally {
      onConfirm();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}> 
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}> 
            <Text style={[styles.badgeText, { color: theme.colors.primaryText }]}>NUDGE</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>通知をオフにしますか？</Text>
          <Text style={[styles.body, { color: theme.colors.muted }]}>
            集中の邪魔になりそうな通知を一時的にオフにできます。選択は自由です。
          </Text>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleDisable}
          >
            <Text style={[styles.primaryButtonText, { color: theme.colors.primaryText }]}>オフにする（おすすめ）</Text>
          </Pressable>
          <Pressable
            style={[styles.ghostButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            onPress={onSkip}
          >
            <Text style={[styles.ghostButtonText, { color: theme.colors.text }]}>このままで進む</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 1.8,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  body: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  ghostButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  ghostButtonText: {
    fontWeight: '600',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
