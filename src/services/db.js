import { studentsData } from '../data/studentsData';

const API_URL = import.meta.env.VITE_API_URL || '';
let cachedRecords = null;

// Get all attendance records
export const getAttendanceRecords = async () => {
  try {
    const response = await fetch(`${API_URL}/api/attendance`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    cachedRecords = data;
    return data;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return cachedRecords || {};
  }
};

// Save attendance for a specific date
export const saveAttendance = async (dateStr, presentStudents, lectureConducted = false) => {
  try {
    await fetch(`${API_URL}/api/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: dateStr, presentStudents, lectureConducted }),
    });
    
    // Update local cache
    if (cachedRecords) {
      cachedRecords[dateStr] = { presentStudents, lectureConducted };
    }
  } catch (error) {
    console.error("Error saving attendance:", error);
  }
};

// Get statistics for each student
export const getStudentStatistics = async () => {
  const records = await getAttendanceRecords();
  const dates = Object.keys(records);
  
  // Only count dates where lecture was actually conducted
  const conductedDates = dates.filter(date => records[date]?.lectureConducted === true);
  const totalClasses = conductedDates.length;

  return studentsData.map(student => {
    const classesAttended = conductedDates.reduce((count, date) => {
      const isPresent = records[date]?.presentStudents?.includes(student.mis);
      return isPresent ? count + 1 : count;
    }, 0);

    const percentage = totalClasses === 0 ? 0 : Math.round((classesAttended / totalClasses) * 100);

    return {
      ...student,
      classesAttended,
      totalClasses,
      percentage
    };
  });
};
