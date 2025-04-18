import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";


// Default days
const defaultDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

// Check for teacher conflicts (unchanged)
function checkConflicts(schedule, days, classNames, timeSlots) {
  for (const day of days) {
    for (let slotIndex = 0; slotIndex < timeSlots.length; slotIndex++) {
      const seenTeachers = new Set();
      for (const className of classNames) {
        const { teacher } = schedule[className][day][slotIndex];
        const trimmedTeacher = teacher.trim();
        if (trimmedTeacher !== "") {
          if (seenTeachers.has(trimmedTeacher)) {
            const { start, end } = timeSlots[slotIndex];
            return `Conflict on ${day}, ${start}-${end}: Teacher "${trimmedTeacher}" is assigned to multiple classes.`;
          }
          seenTeachers.add(trimmedTeacher);
        }
      }
    }
  }
  return "";
}

// A small helper to read from localStorage or use a default
function getLocalStorageOrDefault(key, defaultValue) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
}

// Map each subject to a specific background color
const SUBJECT_COLORS = {
  Hifz:               "#f0ec13",  // Red
  Ammapara:           "#f39c12",  // Orange
  Najera:             "#34495e",  // Purple
  Qaida:              "#3498db",  // Blue
  Arabic:             "#1300f7",  // Teal
  Bangla:             "#2ecc71",  // Green
  English:            "#d35400",  // Dark Orange
  Math:               "#8e44ad",  // Violet
  Science:            "#16a085",  // Dark Cyan
  BGS:                "#f1c40f",  // Yellow
  Deen:               "#c0392b",  // Crimson
  Tiffin:             "#f81f0b",  // Dark Blue Grey
  Lunch:              "#f81f0b",  // Emerald Green
  Meal:               "#f81f0b",  // Carrot Orange
  "Hifz Revision":    "#bdc3c7",  // Silver
  "Ammapara Revision":"#95a5a6",  // Concrete Grey
  "Najera Revision":  "#7f8c8d",  // Slate Grey
  "Qaida Revision":   "#2c3e50"   // Midnight Blue
};





export default function DynamicScheduler() {
  // ---------------------------
  // 1) CONFIGURATION STATE
  // ---------------------------
  const [days, setDays] = useState(defaultDays);
  const [hasGeneratedSchedule, setHasGeneratedSchedule] = useState(
    () => getLocalStorageOrDefault("hasGeneratedSchedule", false)
  );


 // Read from localStorage if available, otherwise use your old defaults
 const [numberOfClasses, setNumberOfClasses] = useState(
  () => getLocalStorageOrDefault("numberOfClasses", 2)
);
const [classNames, setClassNames] = useState(
  () => getLocalStorageOrDefault("classNames", ["Nursery", "KG"])
);
const [numberOfPeriods, setNumberOfPeriods] = useState(
  () => getLocalStorageOrDefault("numberOfPeriods", 2)
);
const [timeSlots, setTimeSlots] = useState(
  () => getLocalStorageOrDefault("timeSlots", [
    { start: "7:30", end: "8:30" },
    { start: "8:30", end: "9:40" },
  ])
);

  function getSubjectColor(subject) {
    if (!subject) return "#FFFFFF"; // White for empty/no subject
    // If the subject is recognized, return the mapped color; otherwise a default gray.
    return SUBJECT_COLORS[subject] || "#F5F5F5";
  }
  

  // ---------------------------
  // 2) SCHEDULE STATE
  // ---------------------------
  // schedule[className][day][slotIndex] = { subject: "", teacher: "" }
  const [schedule, setSchedule] = useState(
    () => getLocalStorageOrDefault("schedule", null)
  );
  const [error, setError] = useState("");

    // ---------------------------
  // Retrieve saved data on mount
  // ---------------------------
  useEffect(() => {
    const savedNumberOfPeriods = localStorage.getItem("numberOfPeriods");
  if (savedNumberOfPeriods) {
    setNumberOfPeriods(JSON.parse(savedNumberOfPeriods));
  }

  const savedNumberOfClasses = localStorage.getItem("numberOfClasses");
  if (savedNumberOfClasses) {
    setNumberOfClasses(JSON.parse(savedNumberOfClasses));
  }

    const savedSchedule = localStorage.getItem("schedule");
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    }

    const savedClassNames = localStorage.getItem("classNames");
    if (savedClassNames) {
      setClassNames(JSON.parse(savedClassNames));
    }

    const savedTimeSlots = localStorage.getItem("timeSlots");
    if (savedTimeSlots) {
      setTimeSlots(JSON.parse(savedTimeSlots));
    }
  }, []);

  // ---------------------------
  // Save schedule when it changes
  // ---------------------------

  useEffect(() => {
    localStorage.setItem("hasGeneratedSchedule", JSON.stringify(hasGeneratedSchedule));
  }, [hasGeneratedSchedule]);

  useEffect(() => {
    if (schedule) {
      localStorage.setItem("schedule", JSON.stringify(schedule));
    }
  }, [schedule]);

  // Save classNames and timeSlots when they change
  useEffect(() => {
    localStorage.setItem("classNames", JSON.stringify(classNames));
  }, [classNames]);

  useEffect(() => {
    localStorage.setItem("timeSlots", JSON.stringify(timeSlots));
  }, [timeSlots]);

  useEffect(() => {
    localStorage.setItem("numberOfPeriods", JSON.stringify(numberOfPeriods));
  }, [numberOfPeriods]);

  useEffect(() => {
    localStorage.setItem("numberOfClasses", JSON.stringify(numberOfClasses));
  }, [numberOfClasses]);

  // ---------------------------
  // 3) HANDLERS: CONFIG FORM
  // ---------------------------

  // Handle changes to class names
  const handleClassNameChange = (index, value) => {
    setClassNames((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Handle changes to time slot (start/end)
  const handleTimeSlotChange = (index, field, value) => {
    setTimeSlots((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // Adjust classNames array if numberOfClasses changes
  useEffect(() => {
    setClassNames((prev) => {
      const updated = [...prev];
      while (updated.length < numberOfClasses) {
        updated.push(`Class ${updated.length + 1}`);
      }
      while (updated.length > numberOfClasses) {
        updated.pop();
      }
      return updated;
    });
  }, [numberOfClasses]);

  // Adjust timeSlots array if numberOfPeriods changes
  useEffect(() => {
    setTimeSlots((prev) => {
      const updated = [...prev];
      while (updated.length < numberOfPeriods) {
        updated.push({ start: "", end: "" });
      }
      while (updated.length > numberOfPeriods) {
        updated.pop();
      }
      return updated;
    });
  }, [numberOfPeriods]);

  // If there's a schedule in localStorage (non-null), we can ensure hasGeneratedSchedule = true
  // (If you prefer controlling this strictly via "Generate" button, you can remove this.)
  useEffect(() => {
    if (schedule) {
      setHasGeneratedSchedule(true);
    }
  }, [schedule]);

  // Create a fresh schedule object
  const createInitialSchedule = () => {
    const newSchedule = {};
    classNames.forEach((className) => {
      newSchedule[className] = {};
      days.forEach((day) => {
        newSchedule[className][day] = timeSlots.map(() => ({
          subject: "",
          teacher: "",
        }));
      });
    });
    return newSchedule;
  };

  // Generate schedule when user clicks button
  const handleGenerateSchedule = () => {
    setSchedule(createInitialSchedule());
    setError("");
    setHasGeneratedSchedule(true);
  };
  

  const handleCreateNewRoutine = () => {
    // Option 1: Clear localStorage entirely, or remove only your keys
    localStorage.removeItem("schedule");
    localStorage.removeItem("classNames");
    localStorage.removeItem("timeSlots");
    localStorage.removeItem("numberOfClasses");
    localStorage.removeItem("numberOfPeriods");
    localStorage.removeItem("hasGeneratedSchedule");
    
    // Option 2: Reset states back to defaults
    setNumberOfClasses(2);
    setClassNames(["Nursery", "KG"]);
    setNumberOfPeriods(2);
    setTimeSlots([
      { start: "7:30", end: "8:30" },
      { start: "8:30", end: "9:40" },
    ]);
    setSchedule(null);
    setError("");
    setHasGeneratedSchedule(false);
  };
  

  // ---------------------------
  // 4) SCHEDULE EDITING
  // ---------------------------
  const handleScheduleChange = (className, day, slotIndex, field, value) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      updated[className][day][slotIndex][field] = value;

      // Check conflict
      const conflictMsg = checkConflicts(updated, days, classNames, timeSlots);
      if (conflictMsg) {
        alert(conflictMsg);
        setError(conflictMsg);
        return prev; // revert
      } else {
        setError("");
        return updated;
      }
    });
  };

  // ---------------------------
  // 5) DOWNLOAD CSV (Pivot Format)
  // ---------------------------
  const handleDownloadXLSX = () => {
    if (!schedule) {
      alert("No schedule to download. Please generate first.");
      return;
    }
    if (error) {
      alert("Cannot download. There's a conflict: " + error);
      return;
    }
  
    // Create a new empty workbook
    const workbook = XLSX.utils.book_new();
  
    // For each class, build a separate worksheet
    classNames.forEach((className) => {
      // Build a 2D array for this class’s sheet
      const sheetData = [];
  
      // 1) First row: Class name
      sheetData.push([className]);
  
      // 2) Second row: Headers -> "Day", then each time slot
      const headerRow = ["Day"];
      timeSlots.forEach((slot) => {
        headerRow.push(`${slot.start}-${slot.end}`);
      });
      sheetData.push(headerRow);
  
      // 3) Subsequent rows: one row per Day
      days.forEach((day) => {
        // First cell is the Day
        const row = [day];
        // Then each time slot in columns
        timeSlots.forEach((_, slotIndex) => {
          const cellData = schedule[className][day][slotIndex];
          // Combine Subject & Teacher in one cell, separated by newline
          const subject = cellData.subject || "";
          const teacher = cellData.teacher || "";
          // Use \n for a new line (Excel will wrap if we enable wrapText)
          const combined = subject + (teacher ? ` - ${teacher}` : "");

          row.push(combined);
        });
        sheetData.push(row);
      });
  
      // Convert the 2D array to a worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
      // OPTIONAL: Enable wrapText on all cells in this sheet
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cellRef]) continue;
          // Create a style object if not present
          if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
          if (!worksheet[cellRef].s.alignment) worksheet[cellRef].s.alignment = {};
          worksheet[cellRef].s.alignment.wrapText = true;
        }
      }
  
      // Add this sheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, className);
    });
  
    // Finally, write the workbook to a binary array
    const xlsxBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  
    // Convert to a Blob and trigger download
    const blob = new Blob([xlsxBuffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = "schedule.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  

  // ---------------------------
  // 6) RENDER
  // ---------------------------
  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Dynamic Scheduler</h1>

      {/* CONFIGURATION FORM */}
      {!hasGeneratedSchedule ? (
      <div className="bg-gray-50 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="flex flex-col space-y-4">
          {/* Number of Classes */}
          <div>
            <label className="block mb-1 font-medium">Number of Classes:</label>
            <input
              type="number"
              min={1}
              value={numberOfClasses}
              onChange={(e) => setNumberOfClasses(parseInt(e.target.value) || 1)}
              className="border p-1 rounded w-32"
            />
          </div>

          {/* Class Names */}
          <div>
            <label className="block mb-1 font-medium">Class Names:</label>
            <div className="space-y-2">
              {classNames.map((cn, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={cn}
                  onChange={(e) => handleClassNameChange(idx, e.target.value)}
                  className="border p-1 rounded block"
                />
              ))}
            </div>
          </div>

          {/* Number of Periods */}
          <div>
            <label className="block mb-1 font-medium">Number of Periods:</label>
            <input
              type="number"
              min={1}
              value={numberOfPeriods}
              onChange={(e) =>
                setNumberOfPeriods(parseInt(e.target.value) || 1)
              }
              className="border p-1 rounded w-32"
            />
          </div>

          {/* Period Durations */}
          <div>
            <label className="block mb-1 font-medium">
              Time Slots (Start - End):
            </label>
            <div className="space-y-2">
              {timeSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Start"
                    value={slot.start}
                    onChange={(e) =>
                      handleTimeSlotChange(idx, "start", e.target.value)
                    }
                    className="border p-1 rounded w-20"
                  />
                  <span>-</span>
                  <input
                    type="text"
                    placeholder="End"
                    value={slot.end}
                    onChange={(e) =>
                      handleTimeSlotChange(idx, "end", e.target.value)
                    }
                    className="border p-1 rounded w-20"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateSchedule}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          >
            Generate Schedule
          </button>
        </div>
      </div>
    ) : (
      // === If the schedule is generated, hide config and show a button ===
      <div>
        <button
          onClick={handleCreateNewRoutine}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        >
          Create New Routine
        </button>
      </div>
    )}


      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {/* SCHEDULE TABLES */}
      {schedule && (
        <div>
          {classNames.map((className) => (
            <div key={className} className="mb-8">
              <h2 className="text-lg font-semibold mb-2">{className}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse mb-4">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border p-2">Day</th>
                      {timeSlots.map((slot, idx) => (
                        <th key={idx} className="border p-2">
                          {slot.start} - {slot.end}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day) => (
                      <tr key={day}>
                        <td className="border p-2 bg-blue-50 font-medium">
                          {day}
                        </td>
                        {timeSlots.map((slot, slotIndex) => {
                          const cellData = schedule[className][day][slotIndex];
                          return (
                            <td key={slotIndex} className="border p-2 align-top"
                            style={{ backgroundColor: getSubjectColor(cellData.subject) }}
                            >
                              <div className="flex flex-col space-y-2">
                                <input
                                  type="text"
                                  placeholder="Subject"
                                  value={cellData.subject}
                                  onChange={(e) =>
                                    handleScheduleChange(
                                      className,
                                      day,
                                      slotIndex,
                                      "subject",
                                      e.target.value
                                    )
                                  }
                                  className="border p-1 rounded"
                                />
                                <input
                                  type="text"
                                  placeholder="Teacher"
                                  value={cellData.teacher}
                                  onChange={(e) =>
                                    handleScheduleChange(
                                      className,
                                      day,
                                      slotIndex,
                                      "teacher",
                                      e.target.value
                                    )
                                  }
                                  className="border p-1 rounded"
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* DOWNLOAD CSV BUTTON */}
          <button
            onClick={handleDownloadXLSX}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Download CSV
          </button>
        </div>
      )}
      {schedule && (
        <div>
          {/* === NEW: Teacher Assignments Chart === */}
          <TeacherDayChart
            schedule={schedule}
            days={days}
            classNames={classNames}
            timeSlots={timeSlots}
          />
        </div>
      )}
    </div>
  );
}


function buildTeacherDayCount(schedule, days, classNames, timeSlots) {
  const teacherDayCount = {};

  for (const className of classNames) {
    for (const day of days) {
      for (let slotIndex = 0; slotIndex < timeSlots.length; slotIndex++) {
        const teacher = schedule[className][day][slotIndex].teacher.trim();
        if (teacher) {
          if (!teacherDayCount[teacher]) {
            teacherDayCount[teacher] = {};
          }
          if (!teacherDayCount[teacher][day]) {
            teacherDayCount[teacher][day] = 0;
          }
          teacherDayCount[teacher][day]++;
        }
      }
    }
  }

  return teacherDayCount;
}

/** Child component: Renders the teacher-day summary table */
function TeacherDayChart({ schedule, days, classNames, timeSlots }) {
  const teacherDayCount = buildTeacherDayCount(schedule, days, classNames, timeSlots);
  const teacherNames = Object.keys(teacherDayCount).sort();

  if (teacherNames.length === 0) {
    return <p>No teacher assignments yet.</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Teacher Assignments per Day</h2>
      <table className="min-w-full border-collapse mb-4">
        <thead>
          <tr className="bg-blue-100">
            <th className="border p-2">Teacher</th>
            {days.map((day) => (
              <th key={day} className="border p-2">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teacherNames.map((teacher) => (
            <tr key={teacher}>
              <td className="border p-2 font-medium">{teacher}</td>
              {days.map((day) => (
                <td key={day} className="border p-2 text-center">
                  {teacherDayCount[teacher][day] || 0}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}