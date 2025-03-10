# Avihu Team Admin App Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.1.1] - Unreleased

### Added

- Added ability to delete a user from User's table.
- Added ability to double click on row to view items.
- Added modal warning when user changes a muscle group.
- Added global back button component and implemented in all forms.
- Added user photos to user dashboard
- Added url search params to workout progression page for better experience when refreshing page.
  
### Fixed

- Fixed weigh ins not being displayed properly in the calendar.
- Fixed multiple inproper validation checks causing issues to add/update items.
- Fixed issue where you can have less maxReps than minReps.
- Fixed issue where selecting a diet plan preset would not update the page properly.
- Fixed issue where selecting a workout plan preset would not update the page properly.
- Fixed combobox loader not working in muscleGroup selector
- Fixed issue where weigh ins page showed an error if user had no weigh ins.
- Fixed issue where you could not leave maxReps as 0.
- Fixed Loader bug when selecting size medium the loader would not be round.
- Fixed default diet plan loading for users with existing plans
- Fixed workout plan presets caching invalidation issue when adding/updating workout plan preset.
- Fixed issue where the description in the error toast was not shown in the UserForm.
- Fixed issue in creating a menu item, when receiving an error sucess toast would still show up.
- Fixed issue where a bad cache key name would prevent a fetch for user weigh ins
- Fixed issue where you could not close muscle group selector if you did not have a muscle group selected.

### Changed

- Muscle group selection opens right away when creating workouts.
- Diet plan now updates automatically when creating/editing.
- Multiple UI/UX improvements.
- Implemented React Query in most forms
- User now returns to previous pages when submitting a form.
- Prevented users from clicking submit button while the request is processing.
- Filtered out selected muscle groups and exercises to avoid duplicates.
- Exercise selection opens right away when selecting muscle group.
- Existing exercises get deleted when muscle group gets changed.
- Added props to delete modal to make it more generic
- Moved vegetables and fats from meal item and added into sidebar (interface and form)
