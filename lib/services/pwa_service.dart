import 'dart:html' as html;
import 'package:flutter/foundation.dart';

class PWAService {
  static bool get isSupported {
    if (kIsWeb) {
      return html.window.navigator.serviceWorker != null;
    }
    return false;
  }

  static bool get isInstalled {
    if (kIsWeb) {
      try {
        return html.window.matchMedia('(display-mode: standalone)').matches;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  static bool get canInstall {
    if (kIsWeb) {
      try {
        return html.window.navigator.userAgent.contains('Mobile') ||
               html.window.navigator.userAgent.contains('Android') ||
               html.window.navigator.userAgent.contains('iPhone');
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  static Future<bool> promptInstall() async {
    if (kIsWeb && canInstall) {
      try {
        // This would typically use the beforeinstallprompt event
        // For now, we'll show a simple alert
        html.window.alert('To install this app, use your browser\'s "Add to Home Screen" option.');
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }
}