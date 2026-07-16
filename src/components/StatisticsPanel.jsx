import { useState, useEffect, useRef } from 'react';
import { getStudentStatistics } from '../services/db';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, ChevronDown } from 'lucide-react';
import { generateStatisticsExcel } from '../utils/excelGenerator';

export default function StatisticsPanel() {
  const [stats, setStats] = useState([]);

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
      const data = await getStudentStatistics();
      setStats(data);
    };
    loadData();
  }, []);

  const totalClasses = stats.length > 0 ? stats[0].totalClasses : 0;
  
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("Prestressed Concrete Structures - Attendance Report", 14, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Professor: Dr. Ashish Akhare", 14, 28);
    doc.text(`Total Classes Conducted: ${totalClasses}`, 14, 35);
    
    const tableData = stats.map(s => [
      s.srNo, 
      s.mis, 
      s.name, 
      s.classesAttended, 
      `${s.percentage}%`
    ]);

    autoTable(doc, {
      startY: 42,
      head: [['Sr No', 'MIS', 'Name', 'Classes Attended', 'Percentage']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles: {
        0: { halign: 'center' }
      }
    });

    doc.save('Attendance_Report.pdf');
    setShowDropdown(false);
  };

  const generateExcel = () => {
    generateStatisticsExcel(stats, totalClasses);
    setShowDropdown(false);
  };

  return (
    <div className="glass-panel">
      <div className="toolbar">
        <div>
          <h2 style={{ marginBottom: '0.5rem' }}>Overview</h2>
          <p style={{ color: 'var(--text-muted)' }}>Total Classes: {totalClasses}</p>
        </div>
        <div className="dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
          <button className="btn btn-primary" onClick={() => setShowDropdown(!showDropdown)}>
            <Download size={18} />
            Export Report
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
                onClick={generatePDF}
                onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Export as PDF
              </button>
              <button 
                style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', color: '#333' }} 
                onClick={generateExcel}
                onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Export as Excel
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: '400px', marginBottom: '3rem', background: 'white', padding: '1rem', borderRadius: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mis" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="percentage" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Attendance %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Sr No</th>
              <th>MIS</th>
              <th>Name</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(student => (
              <tr key={student.mis}>
                <td>{student.srNo}</td>
                <td>{student.mis}</td>
                <td style={{ fontWeight: 500 }}>{student.name}</td>
                <td>
                  <span className={`badge ${
                    student.percentage >= 75 ? 'badge-green' : 
                    student.percentage >= 50 ? 'badge-yellow' : 'badge-red'
                  }`}>
                    {student.percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
