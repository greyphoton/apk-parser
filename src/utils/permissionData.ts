export interface KnownPermission {
  level: 'normal' | 'dangerous' | 'signature' | 'system';
  group: string;
  description: string;
}

export const KNOWN_PERMISSIONS: Record<string, KnownPermission> = {
  'android.permission.INTERNET': {
    level: 'normal',
    group: 'Network',
    description: 'Allows the application to open network sockets.',
  },
  'android.permission.ACCESS_NETWORK_STATE': {
    level: 'normal',
    group: 'Network',
    description: 'Allows applications to access information about networks.',
  },
  'android.permission.ACCESS_WIFI_STATE': {
    level: 'normal',
    group: 'Network',
    description: 'Allows applications to access information about Wi-Fi networks.',
  },
  'android.permission.CHANGE_WIFI_STATE': {
    level: 'normal',
    group: 'Network',
    description: 'Allows applications to change Wi-Fi connectivity state.',
  },
  'android.permission.WAKE_LOCK': {
    level: 'normal',
    group: 'Device Power',
    description: 'Allows using PowerManager WakeLocks to keep processor from sleeping or screen from dimming.',
  },
  'android.permission.VIBRATE': {
    level: 'normal',
    group: 'Device Hardware',
    description: 'Allows access to the vibrator.',
  },
  'android.permission.RECEIVE_BOOT_COMPLETED': {
    level: 'normal',
    group: 'System Startup',
    description: 'Allows an application to receive the ACTION_BOOT_COMPLETED that is broadcast after system boots.',
  },
  'android.permission.FOREGROUND_SERVICE': {
    level: 'normal',
    group: 'Background Services',
    description: 'Allows a regular application to use foreground services.',
  },
  'android.permission.POST_NOTIFICATIONS': {
    level: 'dangerous',
    group: 'Notifications',
    description: 'Required to post notifications in Android 13+ (API 33+).',
  },
  'android.permission.CAMERA': {
    level: 'dangerous',
    group: 'Camera',
    description: 'Required to be able to access the camera device and capture photos or videos.',
  },
  'android.permission.RECORD_AUDIO': {
    level: 'dangerous',
    group: 'Microphone',
    description: 'Allows an application to record audio from microphone.',
  },
  'android.permission.ACCESS_FINE_LOCATION': {
    level: 'dangerous',
    group: 'Location',
    description: 'Allows an app to access precise geographic location from GPS and cellular sources.',
  },
  'android.permission.ACCESS_COARSE_LOCATION': {
    level: 'dangerous',
    group: 'Location',
    description: 'Allows an app to access approximate location from network towers and Wi-Fi.',
  },
  'android.permission.ACCESS_BACKGROUND_LOCATION': {
    level: 'dangerous',
    group: 'Location',
    description: 'Allows an app to access location in the background while the app is not in use.',
  },
  'android.permission.READ_CONTACTS': {
    level: 'dangerous',
    group: 'Contacts',
    description: 'Allows an application to read the user\'s contacts data.',
  },
  'android.permission.WRITE_CONTACTS': {
    level: 'dangerous',
    group: 'Contacts',
    description: 'Allows an application to write the user\'s contacts data.',
  },
  'android.permission.READ_CALENDAR': {
    level: 'dangerous',
    group: 'Calendar',
    description: 'Allows an application to read the user\'s calendar data.',
  },
  'android.permission.WRITE_CALENDAR': {
    level: 'dangerous',
    group: 'Calendar',
    description: 'Allows an application to write the user\'s calendar data.',
  },
  'android.permission.READ_EXTERNAL_STORAGE': {
    level: 'dangerous',
    group: 'Storage',
    description: 'Allows an application to read from external shared storage.',
  },
  'android.permission.WRITE_EXTERNAL_STORAGE': {
    level: 'dangerous',
    group: 'Storage',
    description: 'Allows an application to write to external shared storage.',
  },
  'android.permission.READ_MEDIA_IMAGES': {
    level: 'dangerous',
    group: 'Media Storage',
    description: 'Allows an application to read image files from external storage (Android 13+).',
  },
  'android.permission.READ_MEDIA_VIDEO': {
    level: 'dangerous',
    group: 'Media Storage',
    description: 'Allows an application to read video files from external storage (Android 13+).',
  },
  'android.permission.READ_MEDIA_AUDIO': {
    level: 'dangerous',
    group: 'Media Storage',
    description: 'Allows an application to read audio files from external storage (Android 13+).',
  },
  'android.permission.READ_PHONE_STATE': {
    level: 'dangerous',
    group: 'Phone',
    description: 'Allows read-only access to phone state, cellular network info, and ongoing calls.',
  },
  'android.permission.CALL_PHONE': {
    level: 'dangerous',
    group: 'Phone',
    description: 'Allows an application to initiate a phone call without going through the Dialer.',
  },
  'android.permission.SEND_SMS': {
    level: 'dangerous',
    group: 'SMS',
    description: 'Allows an application to send SMS messages.',
  },
  'android.permission.RECEIVE_SMS': {
    level: 'dangerous',
    group: 'SMS',
    description: 'Allows an application to receive and process SMS messages.',
  },
  'android.permission.READ_SMS': {
    level: 'dangerous',
    group: 'SMS',
    description: 'Allows an application to read SMS messages.',
  },
  'android.permission.BODY_SENSORS': {
    level: 'dangerous',
    group: 'Sensors',
    description: 'Allows an application to access data from sensors that the user uses to measure biological state (heart rate, etc.).',
  },
  'android.permission.ACTIVITY_RECOGNITION': {
    level: 'dangerous',
    group: 'Sensors',
    description: 'Allows an application to recognize physical activity (walking, biking, driving).',
  },
  'android.permission.BLUETOOTH': {
    level: 'normal',
    group: 'Bluetooth',
    description: 'Allows applications to connect to paired bluetooth devices.',
  },
  'android.permission.BLUETOOTH_ADMIN': {
    level: 'normal',
    group: 'Bluetooth',
    description: 'Allows applications to discover and pair bluetooth devices.',
  },
  'android.permission.BLUETOOTH_SCAN': {
    level: 'dangerous',
    group: 'Bluetooth',
    description: 'Required to be able to discover and pair nearby Bluetooth devices (Android 12+).',
  },
  'android.permission.BLUETOOTH_CONNECT': {
    level: 'dangerous',
    group: 'Bluetooth',
    description: 'Required to be able to connect to paired Bluetooth devices (Android 12+).',
  },
  'android.permission.USE_BIOMETRIC': {
    level: 'normal',
    group: 'Biometrics',
    description: 'Allows an application to use device supported biometric modalities.',
  },
  'android.permission.USE_FINGERPRINT': {
    level: 'normal',
    group: 'Biometrics',
    description: 'Allows an application to use fingerprint hardware (deprecated in favor of USE_BIOMETRIC).',
  },
  'android.permission.SYSTEM_ALERT_WINDOW': {
    level: 'signature',
    group: 'Display Overlays',
    description: 'Allows an app to create windows shown on top of all other apps (SYSTEM_ALERT_WINDOW).',
  },
  'android.permission.WRITE_SETTINGS': {
    level: 'signature',
    group: 'System Settings',
    description: 'Allows an application to read or write the system settings.',
  },
  'android.permission.REQUEST_INSTALL_PACKAGES': {
    level: 'signature',
    group: 'Package Management',
    description: 'Allows an application to request installing packages (sideloading).',
  },
};

export function lookupPermission(name: string): {
  level: 'normal' | 'dangerous' | 'signature' | 'system' | 'custom';
  group: string;
  description: string;
} {
  if (KNOWN_PERMISSIONS[name]) {
    return KNOWN_PERMISSIONS[name];
  }
  if (name.startsWith('android.permission.')) {
    return {
      level: 'normal',
      group: 'Standard Android',
      description: `Standard Android platform permission: ${name.replace('android.permission.', '')}`,
    };
  }
  return {
    level: 'custom',
    group: 'Custom Application',
    description: 'Custom permission defined by this application or an integrated SDK.',
  };
}
