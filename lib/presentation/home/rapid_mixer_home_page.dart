import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../../widgets/pwa_install_widget.dart';
import '../../widgets/responsive_utils.dart';

class RapidMixerHomePage extends StatefulWidget {
  const RapidMixerHomePage({super.key});

  @override
  State<RapidMixerHomePage> createState() => _RapidMixerHomePageState();
}

class _RapidMixerHomePageState extends State<RapidMixerHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryDark,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.all(4.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                _buildHeader(),
                SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context, 30)),
                
                // Welcome Section
                _buildWelcomeSection(),
                SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context, 20)),
                
                // Quick Actions
                _buildQuickActions(),
                SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context, 20)),
                
                // PWA Install Widget
                PWAInstallWidget(showAsCard: true),
                SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context, 20)),
              ],
            ),
          ),
        ),
      ),
      // PWA Install Floating Button
      floatingActionButton: PWAInstallWidget(showAsFloatingButton: true, showAsCard: false),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Expanded(
          child: Text(
            'Rapid Mixer',
            style: AppTheme.darkTheme.textTheme.headlineLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
        ),
        IconButton(
          onPressed: () {
            // Settings action
          },
          icon: Icon(
            Icons.settings,
            color: AppTheme.textPrimary,
            size: 6.w,
          ),
        ),
      ],
    );
  }

  Widget _buildWelcomeSection() {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Welcome to Rapid Mixer',
            style: AppTheme.darkTheme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
          SizedBox(height: 2.h),
          Text(
            'Create amazing audio mixes with AI-powered stem separation and professional editing tools.',
            style: AppTheme.darkTheme.textTheme.bodyMedium?.copyWith(
              color: AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: AppTheme.darkTheme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimary,
          ),
        ),
        SizedBox(height: 2.h),
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                'Import Audio',
                Icons.upload_file,
                () {
                  Navigator.pushNamed(context, AppRoutes.audioImport);
                },
              ),
            ),
            SizedBox(width: 4.w),
            Expanded(
              child: _buildActionCard(
                'Beat Library',
                Icons.library_music,
                () {
                  Navigator.pushNamed(context, AppRoutes.beatLibrary);
                },
              ),
            ),
          ],
        ),
        SizedBox(height: 3.h),
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                'Track Editor',
                Icons.edit,
                () {
                  Navigator.pushNamed(context, AppRoutes.trackEditor);
                },
              ),
            ),
            SizedBox(width: 4.w),
            Expanded(
              child: _buildActionCard(
                'Export',
                Icons.download,
                () {
                  Navigator.pushNamed(context, AppRoutes.exportOptions);
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCard(String title, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: AppTheme.secondaryDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.borderColor),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: AppTheme.accentColor,
              size: 8.w,
            ),
            SizedBox(height: 2.h),
            Text(
              title,
              style: AppTheme.darkTheme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
                color: AppTheme.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}