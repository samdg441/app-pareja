import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const CalendarScreen = () => {
  const { theme } = useTheme();

  // Estados generales
  const [currentView, setCurrentView] = useState('my_habits');
  const [currentUser, setCurrentUser] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [coupleId, setCoupleId] = useState(null);

  // Estados para hábitos
  const [trackers, setTrackers] = useState([]);
  const [selectedTrackerId, setSelectedTrackerId] = useState(null);
  const [trackerLogs, setTrackerLogs] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedIntensity, setSelectedIntensity] = useState(0);

  // Estados para eventos
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');

  // Carga inicial de usuario y pareja
  useFocusEffect(
    useCallback(() => {
      const loadUserAndPartner = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUser(user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile?.couple_id) {
          setCoupleId(profile.couple_id);
          const { data: partner } = await supabase
            .from('profiles')
            .select('*')
            .eq('couple_id', profile.couple_id)
            .neq('id', user.id)
            .single();
          setPartnerProfile(partner || null);
        }
      };
      loadUserAndPartner();
    }, [])
  );

  // Cargar trackers según vista
  useEffect(() => {
    if (!currentUser) return;
    const loadTrackers = async () => {
      let query = supabase.from('trackers').select('*');
      if (currentView === 'my_habits') {
        query = query.eq('user_id', currentUser.id);
      } else if (currentView === 'partner_habits' && partnerProfile) {
        query = query.eq('user_id', partnerProfile.id);
      } else {
        setTrackers([]);
        return;
      }
      const { data } = await query;
      setTrackers(data || []);
      if (data && data.length > 0) {
        setSelectedTrackerId(data[0].id);
      } else {
        setSelectedTrackerId(null);
      }
    };
    loadTrackers();
  }, [currentView, currentUser, partnerProfile]);

  // Cargar logs del tracker seleccionado (sin timezone)
  useEffect(() => {
    if (!selectedTrackerId) return;
    const loadLogs = async () => {
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-31`;
      const { data } = await supabase
        .from('tracker_logs')
        .select('*')
        .eq('tracker_id', selectedTrackerId)
        .gte('date', startDate)
        .lte('date', endDate);
      const logsMap = {};
      data?.forEach(log => {
        const day = parseInt(log.date.split('-')[2], 10);
        logsMap[day] = log.intensity;
      });
      setTrackerLogs(logsMap);
    };
    loadLogs();
  }, [selectedTrackerId, selectedMonth, selectedYear]);

  // Cargar eventos cuando se selecciona 'events'
  useEffect(() => {
    if (currentView !== 'events' || !coupleId) return;
    const loadEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('couple_id', coupleId)
        .order('event_date', { ascending: true });
      setEvents(data || []);
    };
    loadEvents();
  }, [currentView, coupleId]);

  // Funciones auxiliares para el calendario
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };
  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Guardar registro de actividad
  const handleSaveLog = async () => {
    if (!selectedTrackerId || !currentUser) return;
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const { error } = await supabase.from('tracker_logs').upsert({
      tracker_id: selectedTrackerId,
      user_id: currentUser.id,
      date: dateStr,
      intensity: selectedIntensity,
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setTrackerLogs(prev => ({ ...prev, [selectedDate]: selectedIntensity }));
      setLogModalVisible(false);
    }
  };

  // Agregar evento
  const handleAddEvent = async () => {
    if (!newEventTitle.trim() || !selectedDay || !coupleId || !currentUser) return;
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const { error } = await supabase.from('events').insert({
      couple_id: coupleId,
      title: newEventTitle.trim(),
      event_date: dateStr,
      created_by: currentUser.id,
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setNewEventTitle('');
      setEventModalVisible(false);
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('couple_id', coupleId)
        .order('event_date', { ascending: true });
      setEvents(data || []);
    }
  };

  // Eliminar evento
  const handleDeleteEvent = async (eventId) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  // ── Pestañas ─────────────────────────────────────────────────
  const renderTabs = () => (
    <View style={styles.tabRow}>
      {['my_habits', 'partner_habits', 'events'].map(view => {
        const isActive = currentView === view;
        const labels = {
          my_habits: 'MIS HÁBITOS',
          partner_habits: 'MI PAREJA',
          events: 'CITAS / DATES',
        };
        return (
          <TouchableOpacity
            key={view}
            style={[
              styles.tab,
              {
                borderColor: theme.primary,
                backgroundColor: isActive ? theme.primary : theme.cardBackground,
              },
            ]}
            onPress={() => setCurrentView(view)}
          >
            <Text
              style={[
                styles.tabText,
                { color: isActive ? theme.headerTint : theme.textPrimary },
              ]}
            >
              {labels[view]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── Heatmap de hábitos ───────────────────────────────────────
  const renderHeatmap = (readOnly = false) => {
    if (!trackers || trackers.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textPrimary }]}>
            No hay hábitos registrados.{'\n'}¡Crea uno nuevo!
          </Text>
        </View>
      );
    }

    const gridCells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      gridCells.push({ type: 'blank', key: `blank-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      gridCells.push({ type: 'day', day: d, key: `day-${d}` });
    }

    const tracker = trackers.find(t => t.id === selectedTrackerId);
    const colors = tracker?.color_theme
      ? tracker.color_theme.split(',')
      : ['#E0F2FE', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0369A1'];

    const intensityLabels = tracker?.intensity_labels || {};

    const getCellColor = (day) => {
      if (trackerLogs[day] === undefined) return theme.cardBackground;
      return colors[trackerLogs[day]] || colors[0];
    };

    const getTextColor = (day) => {
      const intensity = trackerLogs[day];
      if (intensity === undefined) return theme.textSecondary;
      return intensity >= 2 ? '#FFFFFF' : '#1F2937';
    };

    const today = new Date();
    const isFutureDay = (day) => {
      if (selectedYear > today.getFullYear()) return true;
      if (selectedYear === today.getFullYear() && selectedMonth > today.getMonth()) return true;
      if (selectedYear === today.getFullYear() && selectedMonth === today.getMonth() && day > today.getDate()) return true;
      return false;
    };

    return (
      <View>
        {/* Selector de tracker */}
        {trackers.length > 1 && (
          <View style={styles.trackerSelector}>
            <TouchableOpacity
              onPress={() => {
                const idx = trackers.findIndex(t => t.id === selectedTrackerId);
                const prevIdx = idx > 0 ? idx - 1 : trackers.length - 1;
                setSelectedTrackerId(trackers[prevIdx].id);
              }}
            >
              <Text style={[styles.arrow, { color: theme.primary }]}>◀</Text>
            </TouchableOpacity>
            <Text
              style={[styles.trackerName, { color: theme.textPrimary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {tracker?.name || 'Seleccionar'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const idx = trackers.findIndex(t => t.id === selectedTrackerId);
                const nextIdx = idx < trackers.length - 1 ? idx + 1 : 0;
                setSelectedTrackerId(trackers[nextIdx].id);
              }}
            >
              <Text style={[styles.arrow, { color: theme.primary }]}>▶</Text>
            </TouchableOpacity>
          </View>
        )}

        {trackers.length === 1 && (
          <View style={styles.trackerSelector}>
            <Text
              style={[styles.trackerName, { color: theme.textPrimary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {tracker?.name || 'Seleccionar'}
            </Text>
          </View>
        )}

        {/* Navegación de mes */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrevMonth}>
            <Text style={[styles.arrow, { color: theme.primary }]}>◀</Text>
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: theme.textPrimary }]}>
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Text style={[styles.arrow, { color: theme.primary }]}>▶</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((d, i) => (
            <View key={i} style={styles.weekdayCell}>
              <Text style={[styles.weekdayText, { color: theme.textSecondary }]}>{d}</Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {gridCells.map(cell => {
            if (cell.type === 'blank') return <View key={cell.key} style={styles.blankCell} />;
            const day = cell.day;
            const future = isFutureDay(day);
            const bgColor = future ? theme.background : getCellColor(day);
            const txtColor = future ? theme.textSecondary : getTextColor(day);
            const canPress = !readOnly && !future;
            return (
              <TouchableOpacity
                key={cell.key}
                style={[styles.dayCell, { backgroundColor: bgColor, borderColor: theme.border }]}
                disabled={!canPress}
                onPress={() => {
                  if (!readOnly && !future) {
                    setSelectedDate(day);
                    setSelectedIntensity(trackerLogs[day] || 0);
                    setLogModalVisible(true);
                  }
                }}
              >
                <Text style={[styles.dayText, { color: txtColor }]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botón de registrar */}
        {!readOnly && (
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              setSelectedDate(new Date().getDate());
              setSelectedIntensity(0);
              setLogModalVisible(true);
            }}
          >
            <Text style={[styles.registerButtonText, { color: theme.headerTint }]}>
              REGISTRAR ACTIVIDAD
            </Text>
          </TouchableOpacity>
        )}

        {/* Modal de registro con solo 4 opciones (1‑4) y toggle para limpiar */}
        <Modal visible={logModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.primary }]}>REGISTRAR</Text>
              <Text style={[styles.modalDate, { color: theme.textPrimary }]}>
                {selectedDate}/{selectedMonth + 1}/{selectedYear}
              </Text>
              <View style={styles.intensityRow}>
                {[1, 2, 3, 4].map(lvl => {
                  const label = intensityLabels[lvl] || `${lvl}`;
                  const isSelected = selectedIntensity === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={[
                        styles.intensityBlock,
                        {
                          backgroundColor: colors[lvl],
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setSelectedIntensity(isSelected ? 0 : lvl)}
                    >
                      <Text style={styles.intensityText} numberOfLines={1} adjustsFontSizeToFit>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveLog}
              >
                <Text style={[styles.saveButtonText, { color: theme.headerTint }]}>GUARDAR</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLogModalVisible(false)}>
                <Text style={[styles.cancelText, { color: theme.textSecondary }]}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  // ── Eventos ──────────────────────────────────────────────────
  const renderEvents = () => {
    const eventsByDay = {};
    events.forEach(ev => {
      const day = new Date(ev.event_date).getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(ev);
    });

    const gridCells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      gridCells.push({ type: 'blank', key: `b-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      gridCells.push({ type: 'day', day: d, key: `d-${d}` });
    }

    return (
      <View>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrevMonth}>
            <Text style={[styles.arrow, { color: theme.primary }]}>◀</Text>
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: theme.textPrimary }]}>
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Text style={[styles.arrow, { color: theme.primary }]}>▶</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((d, i) => (
            <View key={i} style={styles.weekdayCell}>
              <Text style={[styles.weekdayText, { color: theme.textSecondary }]}>{d}</Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {gridCells.map(cell => {
            if (cell.type === 'blank') return <View key={cell.key} style={styles.blankCell} />;
            const day = cell.day;
            const hasEvents = eventsByDay[day]?.length > 0;
            const isSelected = selectedDay === day;
            return (
              <TouchableOpacity
                key={cell.key}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayText, { color: isSelected ? theme.headerTint : theme.textPrimary }]}>
                  {day}
                </Text>
                {hasEvents && (
                  <View style={[styles.eventDot, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedDay && (
          <View style={[styles.eventList, { borderColor: theme.border }]}>
            <Text style={[styles.eventListTitle, { color: theme.primary }]}>
              EVENTOS {selectedDay}/{selectedMonth + 1}
            </Text>
            {eventsByDay[selectedDay]?.map(ev => (
              <View key={ev.id} style={styles.eventItem}>
                <Text style={[styles.eventText, { color: theme.textPrimary }]}>{ev.title}</Text>
                <TouchableOpacity onPress={() => handleDeleteEvent(ev.id)}>
                  <Text style={[styles.deleteEvent, { color: 'red' }]}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.addEventButton, { backgroundColor: theme.primary }]}
              onPress={() => setEventModalVisible(true)}
            >
              <Text style={[styles.addEventText, { color: theme.headerTint }]}>
                + AGREGAR EVENTO
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal visible={eventModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.primary }]}>NUEVO EVENTO</Text>
              <TextInput
                style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Título del evento"
                placeholderTextColor={theme.textSecondary}
                value={newEventTitle}
                onChangeText={setNewEventTitle}
                fontFamily="PressStart2P-Regular"
              />
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleAddEvent}
              >
                <Text style={[styles.saveButtonText, { color: theme.headerTint }]}>GUARDAR</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEventModalVisible(false)}>
                <Text style={[styles.cancelText, { color: theme.textSecondary }]}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderTabs()}
      <ScrollView contentContainerStyle={styles.content}>
        {currentView === 'my_habits' && renderHeatmap(false)}
        {currentView === 'partner_habits' && renderHeatmap(true)}
        {currentView === 'events' && renderEvents()}
      </ScrollView>
    </View>
  );
};

export default CalendarScreen;

// ─── Estilos ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 10 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderColor: '#000',
  },
  tab: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 3,
    borderRadius: 4,
  },
  tabText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 8,
  },
  trackerSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  trackerName: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
    marginHorizontal: 10,
    textAlign: 'center',
    flexShrink: 1,
  },
  arrow: {
    fontSize: 20,
    fontFamily: 'PressStart2P-Regular',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  monthText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 14,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  blankCell: {
    width: '13.2%',
    aspectRatio: 1,
    margin: 1,
  },
  dayCell: {
    width: '13.2%',
    aspectRatio: 1,
    borderWidth: 2,
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 3,
  },
  eventList: {
    marginTop: 15,
    borderWidth: 3,
    padding: 10,
  },
  eventListTitle: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 12,
    marginBottom: 10,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  eventText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
    flex: 1,
  },
  deleteEvent: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 14,
    paddingHorizontal: 8,
  },
  addEventButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
  },
  addEventText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
  },
  registerButton: {
    marginVertical: 20,
    paddingVertical: 15,
    borderWidth: 4,
    borderColor: '#000',
    alignItems: 'center',
  },
  registerButtonText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 13,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    borderWidth: 4,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 16,
    marginBottom: 15,
  },
  modalDate: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 12,
    marginBottom: 15,
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // o 'space-around' si prefieres
    width: '100%',
    marginBottom: 20,
  },
  intensityBlock: {
    flex: 1,                         // ocupa el espacio disponible
    aspectRatio: 1,                  // mantiene cuadrado
    marginHorizontal: 4,             // espacio entre bloques
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 9,
    color: '#000',
    textAlign: 'center',
  },
  saveButton: {
    width: '100%',
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 13,
  },
  cancelText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
    marginTop: 5,
  },
  input: {
    width: '100%',
    borderWidth: 3,
    padding: 10,
    marginBottom: 15,
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
  },
});