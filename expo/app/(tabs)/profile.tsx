import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import { Stack } from 'expo-router';
import { User, Target, Bell, Clock, CheckCircle2, Globe, X, Shield, ChevronRight } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useApp, Language } from '@/contexts/AppContext';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useTranslation } from '@/constants/translations';
import { useToast } from '@/hooks/useToast';
import * as Linking from 'expo-linking';

export default function ProfileScreen() {
  const { profile, updateProfile, language, setLanguage, theme, setTheme } = useApp();
  const t = useTranslation(language);
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const { showToast } = useToast();
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    goalId?: string;
    goalLabel?: string;
    recommendedMinutes?: number;
    focusAreas?: string[];
  }>({ visible: false });

  const [timeConfirmModal, setTimeConfirmModal] = useState<{
    visible: boolean;
    minutes?: number;
  }>({ visible: false });

  const goals = [
    { 
      id: 'beginner', 
      label: t.onboarding.beginner, 
      subtitle: t.home.beginner,
      description: t.home.beginnerDesc,
      recommendedMinutes: 7,
      focusAreas: language === 'tr' ? ['Temel sesler', 'Basit tekerleme', 'Nefes kontrolü'] :
                  language === 'en' ? ['Basic sounds', 'Simple tongue twisters', 'Breath control'] :
                  ['Grundlegende Laute', 'Einfache Zungenbrecher', 'Atemkontrolle']
    },
    { 
      id: 'intermediate', 
      label: t.onboarding.intermediate, 
      subtitle: t.home.intermediate,
      description: t.home.intermediateDesc,
      recommendedMinutes: 15,
      focusAreas: language === 'tr' ? ['İkili-üçlü heceler', 'Tonlama', 'Hızlı okuma'] :
                  language === 'en' ? ['Double-triple syllables', 'Intonation', 'Speed reading'] :
                  ['Doppel-Dreifach-Silben', 'Intonation', 'Schnelllesen']
    },
    { 
      id: 'advanced', 
      label: t.onboarding.advanced, 
      subtitle: t.home.advanced,
      description: t.home.advancedDesc,
      recommendedMinutes: 30,
      focusAreas: language === 'tr' ? ['Sahne konuşması', 'Doğaçlama', 'Profesyonel analiz'] :
                  language === 'en' ? ['Stage speaking', 'Improvisation', 'Professional analysis'] :
                  ['Bühnensprechen', 'Improvisation', 'Professionelle Analyse']
    },
  ];

  const dailyTargets = [3, 7, 15, 30];

  const handleGoalChange = (goalId: string) => {
    const selectedGoal = goals.find(g => g.id === goalId);
    if (!selectedGoal) return;

    setConfirmModal({
      visible: true,
      goalId,
      goalLabel: selectedGoal.label,
      recommendedMinutes: selectedGoal.recommendedMinutes,
      focusAreas: selectedGoal.focusAreas,
    });
  };

  const confirmGoalChange = () => {
    if (!confirmModal.goalId || !confirmModal.goalLabel || !confirmModal.recommendedMinutes) return;

    updateProfile({ 
      goal: confirmModal.goalId as any,
      dailyTargetMinutes: confirmModal.recommendedMinutes
    });

    setConfirmModal({ visible: false });

    showToast(
      t.profile.successMessage
        .replace('{level}', confirmModal.goalLabel)
        .replace('{minutes}', confirmModal.recommendedMinutes.toString()),
      'success'
    );
  };

  const handleDailyTargetChange = (minutes: number) => {
    setTimeConfirmModal({
      visible: true,
      minutes,
    });
  };

  const confirmTimeChange = () => {
    if (!timeConfirmModal.minutes) return;

    updateProfile({ dailyTargetMinutes: timeConfirmModal.minutes });
    setTimeConfirmModal({ visible: false });

    showToast(
      `${t.profile.dailyTarget}: ${timeConfirmModal.minutes} ${t.common.minutes}`,
      'success'
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t.profile.title,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#FFFFFF',
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: Colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
              <User size={40} color="#FFFFFF" />
            </View>
            <Text style={[styles.profileName, { color: Colors.text }]}>{profile.name}</Text>
            <TouchableOpacity 
              style={[styles.editButton, { borderColor: Colors.primary }]}
              onPress={() => {
                console.log('Edit profile pressed');
              }}
            >
              <Text style={[styles.editButtonText, { color: Colors.primary }]}>{t.profile.editProfile}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Globe size={20} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>{t.profile.appearance}</Text>
            </View>
            <View style={styles.optionsList}>
              <View style={[styles.settingCard, { backgroundColor: Colors.surface }]}>
                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabel, { color: Colors.text }]}>{t.profile.theme}</Text>
                  <View style={styles.themeToggle}>
                    <TouchableOpacity
                      style={[
                        styles.themeOption,
                        { backgroundColor: theme === 'light' ? Colors.primary : Colors.borderLight },
                      ]}
                      onPress={() => setTheme('light')}
                    >
                      <Text style={[styles.themeOptionText, { color: theme === 'light' ? '#FFFFFF' : Colors.textSecondary }]}>
                        {t.profile.light}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.themeOption,
                        { backgroundColor: theme === 'dark' ? Colors.primary : Colors.borderLight },
                      ]}
                      onPress={() => setTheme('dark')}
                    >
                      <Text style={[styles.themeOptionText, { color: theme === 'dark' ? '#FFFFFF' : Colors.textSecondary }]}>
                        {t.profile.dark}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Globe size={20} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>{t.profile.language}</Text>
            </View>
            <View style={styles.optionsList}>
              {[{ code: 'tr' as Language, label: t.languages.turkish }, 
                { code: 'en' as Language, label: t.languages.english }, 
                { code: 'de' as Language, label: t.languages.german }].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.optionCard,
                    { 
                      backgroundColor: language === lang.code ? Colors.success : Colors.surface, 
                      borderColor: language === lang.code ? Colors.success : Colors.border 
                    },
                  ]}
                  onPress={() => {
                    Speech.stop();
                    setLanguage(lang.code);
                  }}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionHeader}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: language === lang.code ? '#FFFFFF' : Colors.text },
                        ]}
                      >
                        {lang.label}
                      </Text>
                      {language === lang.code && (
                        <CheckCircle2 size={20} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>{t.profile.yourGoal}</Text>
            </View>
            <View style={styles.optionsList}>
              {goals.map((item) => {
                const isSelected = profile.goal === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.optionCard,
                      { 
                        backgroundColor: isSelected ? Colors.success : Colors.surface, 
                        borderColor: isSelected ? Colors.success : Colors.border 
                      },
                    ]}
                    onPress={() => handleGoalChange(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionHeader}>
                        <View style={styles.goalTitleRow}>
                          <Text
                            style={[
                              styles.optionLabel,
                              { color: isSelected ? '#FFFFFF' : Colors.text },
                            ]}
                          >
                            {item.label}
                          </Text>
                          <View style={[
                            styles.minuteBadge,
                            { backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : Colors.borderLight }
                          ]}>
                            <Clock size={12} color={isSelected ? '#FFFFFF' : Colors.textSecondary} />
                            <Text style={[
                              styles.minuteBadgeText,
                              { color: isSelected ? '#FFFFFF' : Colors.textSecondary }
                            ]}>
                              {item.recommendedMinutes} {t.common.minutes}
                            </Text>
                          </View>
                        </View>
                        {isSelected && (
                          <CheckCircle2 size={22} color="#FFFFFF" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.optionSubtitle,
                          { color: isSelected ? 'rgba(255, 255, 255, 0.9)' : Colors.textSecondary },
                        ]}
                      >
                        {item.subtitle}
                      </Text>
                      <View style={styles.goalDetails}>
                        <Text style={[
                          styles.goalDescription,
                          { color: isSelected ? 'rgba(255, 255, 255, 0.85)' : Colors.textSecondary }
                        ]}>
                          {item.description}
                        </Text>
                        <View style={styles.focusAreas}>
                          {item.focusAreas.map((area, idx) => (
                            <View key={idx} style={[
                              styles.focusTag,
                              { backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : Colors.borderLight }
                            ]}>
                              <Text style={[
                                styles.focusTagText,
                                { color: isSelected ? '#FFFFFF' : Colors.textSecondary }
                              ]}>
                                {area}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>{t.profile.dailyTarget}</Text>
            </View>
            <View style={styles.targetGrid}>
              {dailyTargets.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.targetCard,
                    { 
                      backgroundColor: profile.dailyTargetMinutes === minutes ? Colors.success : Colors.surface, 
                      borderColor: profile.dailyTargetMinutes === minutes ? Colors.success : Colors.border 
                    },
                  ]}
                  onPress={() => handleDailyTargetChange(minutes)}
                >
                  <Text
                    style={[
                      styles.targetValue,
                      { color: profile.dailyTargetMinutes === minutes ? '#FFFFFF' : Colors.text },
                    ]}
                  >
                    {minutes}
                  </Text>
                  <Text
                    style={[
                      styles.targetLabel,
                      { color: profile.dailyTargetMinutes === minutes ? '#FFFFFF' : Colors.textSecondary },
                    ]}
                  >
                    {t.common.minutes}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Bell size={20} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>{t.profile.reminders}</Text>
            </View>
            <View style={[styles.settingCard, { backgroundColor: Colors.surface }]}>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: Colors.text }]}>{t.profile.dailyReminder}</Text>
                <Switch
                  value={profile.reminderEnabled}
                  onValueChange={(value) =>
                    updateProfile({ reminderEnabled: value })
                  }
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
              {profile.reminderEnabled && (
                <View style={[styles.timeSelector, { borderTopColor: Colors.border }]}>
                  <Text style={[styles.timeLabel, { color: Colors.textSecondary }]}>{t.profile.time}:</Text>
                  <View style={styles.timeOptions}>
                    {['09:00', '12:00', '18:00', '21:00'].map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeOption,
                          { backgroundColor: profile.reminderTime === time ? Colors.primary : Colors.borderLight },
                        ]}
                        onPress={() => updateProfile({ reminderTime: time })}
                      >
                        <Text
                          style={[
                            styles.timeOptionText,
                            { color: profile.reminderTime === time ? '#FFFFFF' : Colors.text },
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>{t.profile.legal}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.legalCard, { backgroundColor: Colors.surface, borderColor: Colors.border }]}
              onPress={() => Linking.openURL('https://ciceroapp.com/privacy-policy')}
              activeOpacity={0.7}
            >
              <View style={styles.legalCardContent}>
                <Shield size={24} color={Colors.primary} />
                <Text style={[styles.legalCardText, { color: Colors.text }]}>
                  {t.profile.privacyPolicy}
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={confirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal({ visible: false })}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setConfirmModal({ visible: false })}
        >
          <Pressable 
            style={[styles.modalContent, { backgroundColor: Colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.text }]}>
                {t.profile.goalChangeTitle}
              </Text>
              <TouchableOpacity
                onPress={() => setConfirmModal({ visible: false })}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalMessage, { color: Colors.text }]}>
                {confirmModal.goalLabel} {t.profile.goalChangeMessage}
              </Text>

              <View style={[styles.modalInfoBox, { backgroundColor: Colors.borderLight }]}>
                <View style={styles.modalInfoRow}>
                  <Clock size={16} color={Colors.primary} />
                  <Text style={[styles.modalInfoLabel, { color: Colors.textSecondary }]}>
                    {t.profile.recommendedDaily}:
                  </Text>
                  <Text style={[styles.modalInfoValue, { color: Colors.text }]}>
                    {confirmModal.recommendedMinutes} {t.common.minutes}
                  </Text>
                </View>

                <View style={styles.modalDivider} />

                <View style={styles.modalFocusSection}>
                  <Text style={[styles.modalInfoLabel, { color: Colors.textSecondary }]}>
                    {t.profile.focusAreas}:
                  </Text>
                  <View style={styles.modalFocusList}>
                    {confirmModal.focusAreas?.map((area, idx) => (
                      <View key={idx} style={styles.modalFocusItem}>
                        <Text style={[styles.modalFocusBullet, { color: Colors.primary }]}>•</Text>
                        <Text style={[styles.modalFocusText, { color: Colors.text }]}>{area}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, { borderColor: Colors.border }]}
                onPress={() => setConfirmModal({ visible: false })}
              >
                <Text style={[styles.modalCancelText, { color: Colors.text }]}>
                  {t.common.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton, { backgroundColor: Colors.primary }]}
                onPress={confirmGoalChange}
              >
                <Text style={styles.modalConfirmText}>
                  {t.profile.yes}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={timeConfirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeConfirmModal({ visible: false })}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setTimeConfirmModal({ visible: false })}
        >
          <Pressable 
            style={[styles.modalContent, { backgroundColor: Colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.text }]}>
                {t.profile.dailyTarget}
              </Text>
              <TouchableOpacity
                onPress={() => setTimeConfirmModal({ visible: false })}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalMessage, { color: Colors.text }]}>
                {language === 'tr' 
                  ? `Günlük hedefinizi ${timeConfirmModal.minutes} dakika olarak değiştirmek istediğinizden emin misiniz?`
                  : language === 'en'
                  ? `Are you sure you want to change your daily target to ${timeConfirmModal.minutes} minutes?`
                  : `Möchten Sie Ihr tägliches Ziel wirklich auf ${timeConfirmModal.minutes} Minuten ändern?`}
              </Text>

              <View style={[styles.modalInfoBox, { backgroundColor: Colors.borderLight }]}>
                <View style={styles.modalInfoRow}>
                  <Clock size={16} color={Colors.primary} />
                  <Text style={[styles.modalInfoLabel, { color: Colors.textSecondary }]}>
                    {language === 'tr' ? 'Yeni hedef' : language === 'en' ? 'New target' : 'Neues Ziel'}:
                  </Text>
                  <Text style={[styles.modalInfoValue, { color: Colors.text }]}>
                    {timeConfirmModal.minutes} {t.common.minutes}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, { borderColor: Colors.border }]}
                onPress={() => setTimeConfirmModal({ visible: false })}
              >
                <Text style={[styles.modalCancelText, { color: Colors.text }]}>
                  {t.common.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton, { backgroundColor: Colors.primary }]}
                onPress={confirmTimeChange}
              >
                <Text style={styles.modalConfirmText}>
                  {t.profile.yes}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
  },

  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 0,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  minuteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  minuteBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  optionSubtitle: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },

  goalDetails: {
    marginTop: 12,
  },
  goalDescription: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 17,
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  focusTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  focusTagText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  targetGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  targetCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  targetValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 12,
  },
  settingCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  timeSelector: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  timeLabel: {
    fontSize: 15,
    marginBottom: 12,
  },
  timeOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  referralCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  referralIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  referralTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  referralText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  referralButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  referralButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  legalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  legalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legalCardText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  modalInfoBox: {
    borderRadius: 12,
    padding: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalInfoLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 12,
  },
  modalFocusSection: {
    gap: 8,
  },
  modalFocusList: {
    gap: 6,
    marginTop: 8,
  },
  modalFocusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  modalFocusBullet: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  modalFocusText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    borderWidth: 2,
  },
  modalConfirmButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
