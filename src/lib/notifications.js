import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const ANDROID_CHANNEL_ID = 'default';

// Identificadores de "tipo" que guardamos en data para poder
// cancelar/reprogramar sólo las notificaciones que nos interesan.
const KIND_HABIT = 'habit_reminder';
const KIND_EVENT = 'event_reminder';

// Handler global: define cómo se muestran las notificaciones en primer plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Convierte 'YYYY-MM-DD' en un Date en zona horaria LOCAL.
 * Usar new Date('2026-08-10') interpreta la fecha como UTC y en zonas
 * horarias negativas (ej. UTC-5) devuelve el día anterior.
 */
export function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Pide permisos, crea el canal de Android y deja las notificaciones listas.
 * Devuelve true si hay permiso concedido.
 */
export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 150, 100, 150],
      lightColor: '#FF69B4',
    });
  }

  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

async function cancelByKind(kind) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content?.data?.kind === kind)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/**
 * Programa un recordatorio diario para llenar los cuadraditos de hábitos.
 * Es idempotente: cancela el anterior antes de crear el nuevo.
 */
export async function scheduleDailyHabitReminder(hour = 20, minute = 0) {
  await cancelByKind(KIND_HABIT);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡No olvides tu día! 💖',
      body: 'Registra cómo te fue hoy en tus cuadraditos ⬛️⬛️⬛️',
      data: { kind: KIND_HABIT },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

/**
 * Sincroniza los recordatorios de eventos: cancela los anteriores y programa
 * uno para el día ANTERIOR de cada evento futuro (a las 10:00 local).
 * Como ambas parejas cargan los mismos eventos (couple_id), cada dispositivo
 * programa su propio recordatorio local → los dos reciben el aviso.
 */
export async function syncEventReminders(events = [], hour = 10, minute = 0) {
  await cancelByKind(KIND_EVENT);
  const now = new Date();

  await Promise.all(
    events.map(async (ev) => {
      if (!ev?.event_date) return;
      const eventDate = parseLocalDate(ev.event_date);
      const remindAt = new Date(eventDate);
      remindAt.setDate(remindAt.getDate() - 1);
      remindAt.setHours(hour, minute, 0, 0);

      if (remindAt <= now) return; // ya pasó, no programar

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '¡Cita mañana! 💞',
          body: `Recuerda: "${ev.title}" es mañana`,
          data: { kind: KIND_EVENT, eventId: ev.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: remindAt,
          channelId: ANDROID_CHANNEL_ID,
        },
      });
    })
  );
}
