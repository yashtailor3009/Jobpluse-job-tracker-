/**
 * Utility functions for 1-Click Calendar Sync (Google Calendar & Apple/Outlook .ics)
 */

function formatUtcDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const d = new Date(date);
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

export function generateGoogleCalendarUrl({
  title,
  scheduledAt,
  durationMinutes = 60,
  details = '',
  location = '',
}) {
  const startDate = new Date(scheduledAt);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const startStr = formatUtcDate(startDate);
  const endStr = formatUtcDate(endDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile({
  title,
  scheduledAt,
  durationMinutes = 60,
  details = '',
  location = '',
  companyName = 'Company',
}) {
  const startDate = new Date(scheduledAt);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  const now = new Date();

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JobPulse PRO//Career Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).substring(2, 9)}@jobpulse`,
    `DTSTAMP:${formatUtcDate(now)}`,
    `DTSTART:${formatUtcDate(startDate)}`,
    `DTEND:${formatUtcDate(endDate)}`,
    `SUMMARY:${title.replace(/[,;\\]/g, ' ')}`,
    `DESCRIPTION:${details.replace(/\n/g, '\\n').replace(/[,;\\]/g, ' ')}`,
    `LOCATION:${location.replace(/[,;\\]/g, ' ')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.download = `interview_${safeName}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
