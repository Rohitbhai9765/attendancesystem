import { useState, useEffect } from 'react';
import { getAttendanceRecords } from '../services/db';
import { studentsData } from '../data/studentsData';
import { generateDailyPDF } from '../utils/pdfGenerator';
import { Download } from 'lucide-react';

export default function ViewerPanel() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [presentStudents, setPresentStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const records = await getAttendanceRecords();
      setPresentStudents(records[date] || []);
      setLoading(false);
    };
    loadData();
  }, [date]);

  const handleDownload = () => {
    if (!presentStudents || presentStudents.length === 0) {
      alert("No attendance has been marked for this date yet!");
      return;
    }
    generateDailyPDF(date, presentStudents, studentsData);
  };

  return (
    <div className="glass-panel">
      <div className="toolbar">
        <div className="toolbar-item">
          <label style={{ fontWeight: '500' }}>Select Date:</label>
          <input 
            type="date" 
            className="date-picker"
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
        </div>
        <button className="btn btn-primary" onClick={handleDownload}>
          <Download size={18} />
          Download Daily PDF
        </button>
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
            {loading ? <tr><td colSpan="4">Loading...</td></tr> : studentsData.map((student) => {
              const isPresent = presentStudents.includes(student.mis);
              return (
                <tr key={student.mis}>
                  <td>{student.srNo}</td>
                  <td>{student.mis}</td>
                  <td style={{ fontWeight: 500 }}>{student.name}</td>
                  <td>
                    <span className={`badge ${isPresent ? 'badge-green' : 'badge-red'}`}>
                      {isPresent ? 'Present' : 'Absent'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
