import React from 'react';
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onSkip: () => void;
};

export default function NudgeModal({ visible, onConfirm, onSkip }: Props) {
  const handleDisable = async () => {
    try {
      await Linking.openSettings();
    } finally {
      onConfirm();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NUDGE</Text>
          </View>
          <Text style={styles.title}>通知をオフにしますか？</Text>
          <Text style={styles.body}>
            集中の邪魔になりそうな通知を一時的にオフにできます。選択は自由です。
          </Text>
          <Pressable style={styles.primaryButton} onPress={handleDisable}>
            <Text style={styles.primaryButtonText}>オフにする（おすすめ）</Text>
          </Pressable>
          <Pressable style={styles.ghostButton} onPress={onSkip}>
            <Text style={styles.ghostButtonText}>このままで進む</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#111111',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    letterSpacing: 1.8,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111111',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  body: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  primaryButton: {
    backgroundColor: '#111111',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  ghostButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
  ghostButtonText: {
    color: '#111111',
    fontWeight: '600',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
