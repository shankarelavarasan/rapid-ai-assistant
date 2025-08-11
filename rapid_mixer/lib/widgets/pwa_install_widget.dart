import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../core/app_export.dart';
import '../services/pwa_service.dart';

class PWAInstallWidget extends StatefulWidget {
  final bool showAsCard;
  final bool showAsFloatingButton;
  final String? customText;
  final IconData? customIcon;

  const PWAInstallWidget({
    super.key,
    this.showAsCard = false,
    this.showAsFloatingButton = false,
    this.customText,
    this.customIcon,
  });

  @override
  State<PWAInstallWidget> createState() => _PWAInstallWidgetState();
}

class _PWAInstallWidgetState extends State<PWAInstallWidget> {
  bool _isInstalled = false;
  bool _canInstall = false;

  @override
  void initState() {
    super.initState();
    _checkInstallStatus();
  }

  void _checkInstallStatus() {
    if (kIsWeb) {
      setState(() {
        _isInstalled = PWAService.isInstalled;
        _canInstall = PWAService.canInstall;
      });
    }
  }

  Future<void> _handleInstall() async {
    final success = await PWAService.promptInstall();
    if (success) {
      _checkInstallStatus();
    }
  }

  @override
  Widget build(BuildContext context) {
    // Don't show if not web or already installed
    if (!kIsWeb || _isInstalled) {
      return const SizedBox.shrink();
    }

    if (widget.showAsFloatingButton) {
      return FloatingActionButton(
        onPressed: _handleInstall,
        backgroundColor: AppTheme.accentColor,
        child: Icon(
          widget.customIcon ?? Icons.install_mobile,
          color: AppTheme.primaryDark,
        ),
      );
    }

    if (widget.showAsCard) {
      return Card(
        margin: EdgeInsets.all(4.w),
        child: Padding(
          padding: EdgeInsets.all(4.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.install_mobile,
                    color: AppTheme.accentColor,
                    size: 6.w,
                  ),
                  SizedBox(width: 3.w),
                  Expanded(
                    child: Text(
                      'Install App',
                      style: AppTheme.darkTheme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 2.h),
              Text(
                widget.customText ??
                    'Install this app on your device for a better experience and offline access.',
                style: AppTheme.darkTheme.textTheme.bodyMedium?.copyWith(
                  color: AppTheme.textSecondary,
                ),
              ),
              SizedBox(height: 3.h),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _handleInstall,
                  child: Text('Install Now'),
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Default button style
    return ElevatedButton.icon(
      onPressed: _handleInstall,
      icon: Icon(widget.customIcon ?? Icons.install_mobile),
      label: Text(widget.customText ?? 'Install App'),
    );
  }
}