import { useState, useEffect } from 'react';
import { getStudentStatistics } from '../services/db';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

export default function StatisticsPanel() {
  const [stats, setStats] = useState([]);

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
  };

  return (
    <div className="glass-panel">
      <div className="toolbar">
        <div>
          <h2 style={{ marginBottom: '0.5rem' }}>Overview</h2>
          <p style={{ color: 'var(--text-muted)' }}>Total Classes: {totalClasses}</p>
        </div>
        <button className="btn btn-primary" onClick={generatePDF}>
          <Download size={18} />
          Export to PDF
        </button>
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
