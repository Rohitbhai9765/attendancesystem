import { useState, useEffect } from 'react';
import { studentsData } from '../data/studentsData';
import { getAttendanceRecords, saveAttendance } from '../services/db';

export default function AttendanceTable() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [lectureConducted, setLectureConducted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const records = await getAttendanceRecords();
      const todaysRecord = records[date]?.presentStudents || [];
      const isConducted = records[date]?.lectureConducted ?? false;
      
      const initialAttendance = {};
      studentsData.forEach(student => {
        initialAttendance[student.mis] = todaysRecord.includes(student.mis);
      });
      setAttendance(initialAttendance);
      setLectureConducted(isConducted);
    };
    loadData();
  }, [date]);

  const handleToggle = (mis) => {
    if (!lectureConducted) return;
    const updated = {
      ...attendance,
      [mis]: !attendance[mis]
    };
    setAttendance(updated);
    
    // Save to DB
    const presentStudents = Object.keys(updated).filter(k => updated[k]);
    saveAttendance(date, presentStudents, lectureConducted);
  };

  const markAll = (present) => {
    if (!lectureConducted) return;
    const updated = {};
    studentsData.forEach(s => {
      updated[s.mis] = present;
    });
    setAttendance(updated);
    const presentStudents = present ? studentsData.map(s => s.mis) : [];
    saveAttendance(date, presentStudents, lectureConducted);
  };

  const handleLectureToggle = () => {
    const newStatus = !lectureConducted;
    setLectureConducted(newStatus);
    const presentStudents = Object.keys(attendance).filter(k => attendance[k]);
    saveAttendance(date, presentStudents, newStatus);
  };

  return (
    <div className="glass-panel">
      <div className="toolbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="toolbar-item">
            <label style={{ fontWeight: '500' }}>Date:</label>
            <input 
              type="date" 
              className="date-picker"
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
          <div className="toolbar-item">
            <label style={{ fontWeight: '500', color: lectureConducted ? 'inherit' : 'var(--text-light)' }}>Lecture Conducted:</label>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={lectureConducted}
                onChange={handleLectureToggle}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" disabled={!lectureConducted} style={{ opacity: lectureConducted ? 1 : 0.5 }} onClick={() => markAll(true)}>Mark All Present</button>
          <button className="btn btn-outline" disabled={!lectureConducted} style={{ opacity: lectureConducted ? 1 : 0.5 }} onClick={() => markAll(false)}>Clear All</button>
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Sr No</th>
              <th>MIS</th>
              <th>Name of Student</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {studentsData.map((student) => (
              <tr key={student.mis}>
                <td>{student.srNo}</td>
                <td>{student.mis}</td>
                <td style={{ fontWeight: 500 }}>{student.name}</td>
                <td>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      disabled={!lectureConducted}
                      checked={attendance[student.mis] || false}
                      onChange={() => handleToggle(student.mis)}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
