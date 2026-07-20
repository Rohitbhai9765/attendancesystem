import { useState, useEffect, useRef } from 'react';
import { getAttendanceRecords } from '../services/db';
import { studentsData } from '../data/studentsData';
import { generateDailyPDF } from '../utils/pdfGenerator';
import { generateDailyExcel } from '../utils/excelGenerator';
import { Download, ChevronDown } from 'lucide-react';

export default function ViewerPanel() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [presentStudents, setPresentStudents] = useState([]);
  const [lectureConducted, setLectureConducted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const records = await getAttendanceRecords();
      setPresentStudents(records[date]?.presentStudents || []);
      setLectureConducted(records[date]?.lectureConducted ?? false);
      setLoading(false);
    };
    loadData();
  }, [date]);

  const handleDownloadPDF = () => {
    if (!presentStudents || presentStudents.length === 0) {
      alert("No attendance has been marked for this date yet!");
      return;
    }
    generateDailyPDF(date, presentStudents, studentsData);
    setShowDropdown(false);
  };

  const handleDownloadExcel = () => {
    if (!presentStudents || presentStudents.length === 0) {
      alert("No attendance has been marked for this date yet!");
      return;
    }
    generateDailyExcel(date, presentStudents, studentsData);
    setShowDropdown(false);
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
        <div className="dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
          <button className="btn btn-primary" onClick={() => setShowDropdown(!showDropdown)}>
            <Download size={18} />
            Export Daily Report
            <ChevronDown size={18} />
          </button>
          {showDropdown && (
            <div className="dropdown-menu" style={{ 
              position: 'absolute', top: '100%', right: 0, 
              background: 'white', border: '1px solid #ccc', 
              borderRadius: '8px', zIndex: 10, marginTop: '0.5rem', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '150px',
              overflow: 'hidden'
            }}>
              <button 
                style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', color: '#333' }} 
                onClick={handleDownloadPDF}
                onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Export as PDF
              </button>
              <button 
                style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', color: '#333' }} 
                onClick={handleDownloadExcel}
                onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Export as Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {!lectureConducted && (
        <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
          Lecture was not conducted on this date.
        </div>
      )}

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
