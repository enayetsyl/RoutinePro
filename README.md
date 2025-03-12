# RoutinePro: Dynamic School Scheduler

RoutinePro is a dynamic school scheduling application built with React and Tailwind CSS. It enables you to easily generate, manage, and export school schedules while automatically detecting teacher conflicts and providing a clear visual overview of teacher assignments.

## Overview

RoutinePro lets you:
- **Configure Your Schedule:** Set the number of classes, assign class names, define periods with start and end times, and choose the days for scheduling.
- **Edit Dynamically:** Input subject and teacher information for each time slot in your schedule.
- **Detect Conflicts:** Automatically check for and alert you to teacher assignment conflicts across classes in the same period.
- **Color-Code Subjects:** Apply distinct background colors to different subjects for quick visual identification.
- **View Teacher Summary:** See a summary chart that shows how many classes each teacher is assigned per day.
- **Export to XLSX:** Download your schedule as a neatly formatted Excel file, with each class on its own worksheet.

## Features

- **Configurable Schedule Generation:**
  - Customize the number of classes and specify their names.
  - Set the number of periods and define time slots (start/end times).
  - Define the days of the week for your schedule.

- **Dynamic Schedule Editing & Conflict Detection:**
  - Input subject and teacher details for each cell.
  - Real-time conflict checking prevents assigning the same teacher to multiple classes in the same time slot.
  - Conflicts trigger alerts and revert the conflicting changes.

- **Color-Coded Subjects:**
  - Each subject is assigned a specific background color from a predefined color map.
  - Enhances readability and makes it easy to identify subjects at a glance.

- **Teacher Assignment Summary Chart:**
  - Displays a table with teachers in rows and days in columns.
  - Each cell shows the number of classes a teacher is assigned on that day.

- **XLSX Export:**
  - Export your schedule as a well-formatted Excel file.
  - Each class gets its own worksheet.
  - Schedule cells combine subject and teacher information (separated by a dash) and support text wrapping.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/enayetsyl/RoutinePro.git
   cd RoutinePro
   ```

2. **Install Dependencies:**

```bash
npm install
```

3. **Start the Development Server:**

```bash
npm start
```

## Usage

### Configure the Schedule:

- Set the number of classes and enter class names.
- Define the number of periods and specify time slots (start and end times).
- Click Generate Schedule to create a new, blank schedule.

### Edit the Schedule:

- Input subject and teacher names into each cell.
- The app will alert you and prevent conflicting changes if a teacher is assigned to multiple classes in the same period.
- Each subject cell is color-coded for easy identification.

### View the Teacher Summary:

- Check the summary chart to see how many classes each teacher is assigned per day.

### Export the Schedule:

- Click the Download XLSX button to export your schedule.
- The exported Excel file contains separate worksheets for each class with neatly formatted schedule data.

## Technologies Used
- React – For building the user interface.
- Tailwind CSS – For styling and responsive design.
- SheetJS (xlsx) – For creating and exporting Excel files.

## Contributing
Contributions are welcome! If you have suggestions, bug fixes, or new features, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

Enjoy managing your school schedules with RoutinePro!




