import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

class ResponsiveUtils {
  /// Get responsive spacing based on screen size
  static double getResponsiveSpacing(BuildContext context, double baseSpacing) {
    final screenWidth = MediaQuery.of(context).size.width;
    
    if (screenWidth < 600) {
      // Mobile
      return baseSpacing * 0.8;
    } else if (screenWidth < 1200) {
      // Tablet
      return baseSpacing;
    } else {
      // Desktop
      return baseSpacing * 1.2;
    }
  }

  /// Get responsive font size
  static double getResponsiveFontSize(BuildContext context, double baseFontSize) {
    final screenWidth = MediaQuery.of(context).size.width;
    
    if (screenWidth < 600) {
      // Mobile
      return baseFontSize * 0.9;
    } else if (screenWidth < 1200) {
      // Tablet
      return baseFontSize;
    } else {
      // Desktop
      return baseFontSize * 1.1;
    }
  }

  /// Get responsive padding
  static EdgeInsets getResponsivePadding(BuildContext context, {
    double horizontal = 16.0,
    double vertical = 16.0,
  }) {
    final screenWidth = MediaQuery.of(context).size.width;
    
    if (screenWidth < 600) {
      // Mobile
      return EdgeInsets.symmetric(
        horizontal: horizontal * 0.8,
        vertical: vertical * 0.8,
      );
    } else if (screenWidth < 1200) {
      // Tablet
      return EdgeInsets.symmetric(
        horizontal: horizontal,
        vertical: vertical,
      );
    } else {
      // Desktop
      return EdgeInsets.symmetric(
        horizontal: horizontal * 1.2,
        vertical: vertical * 1.2,
      );
    }
  }

  /// Check if device is mobile
  static bool isMobile(BuildContext context) {
    return MediaQuery.of(context).size.width < 600;
  }

  /// Check if device is tablet
  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= 600 && width < 1200;
  }

  /// Check if device is desktop
  static bool isDesktop(BuildContext context) {
    return MediaQuery.of(context).size.width >= 1200;
  }

  /// Get responsive grid count
  static int getGridCount(BuildContext context, {
    int mobileCount = 2,
    int tabletCount = 3,
    int desktopCount = 4,
  }) {
    if (isMobile(context)) {
      return mobileCount;
    } else if (isTablet(context)) {
      return tabletCount;
    } else {
      return desktopCount;
    }
  }
}