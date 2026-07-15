import { useState, useEffect } from 'react';
import { studentsData } from '../data/studentsData';
import { getAttendanceRecords, saveAttendance } from '../services/db';

export default function AttendanceTable() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const records = await getAttendanceRecords();
      const todaysRecord = records[date] || [];
      
      const initialAttendance = {};
      studentsData.forEach(student => {
        initialAttendance[student.mis] = todaysRecord.includes(student.mis);
      });
      setAttendance(initialAttendance);
    };
    loadData();
  }, [date]);

  const handleToggle = (mis) => {
    const updated = {
      ...attendance,
      [mis]: !attendance[mis]
    };
    setAttendance(updated);
    
    // Save to DB
    const presentStudents = Object.keys(updated).filter(k => updated[k]);
    saveAttendance(date, presentStudents);
  };

  const markAll = (present) => {
    const updated = {};
    studentsData.forEach(s => {
      updated[s.mis] = present;
    });
    setAttendance(updated);
    const presentStudents = present ? studentsData.map(s => s.mis) : [];
    saveAttendance(date, presentStudents);
  };

  return (
    <div className="glass-panel">
      <div className="toolbar">
        <div>
          <label style={{ marginRight: '1rem', fontWeight: '500' }}>Date:</label>
          <input 
            type="date" 
            className="date-picker"
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => markAll(true)}>Mark All Present</button>
          <button className="btn btn-outline" onClick={() => markAll(false)}>Clear All</button>
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
