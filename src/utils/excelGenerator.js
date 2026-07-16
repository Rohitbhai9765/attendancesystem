import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const generateDailyExcel = async (date, presentStudents, studentsData) => {
  const d = new Date(date);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const formattedDate = `${dd}/${mm}/${yy}`;

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const suffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  const dayStr = d.getDate() + suffix(d.getDate());
  const monthStr = months[d.getMonth()];
  const fullYear = d.getFullYear();
  const attendanceTitle = `ATTENDANCE: ${dayStr} ${monthStr} ${fullYear}`;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance');

  worksheet.columns = [
    { key: 'srNo', width: 10 },
    { key: 'mis', width: 20 },
    { key: 'name', width: 40 },
    { key: 'status', width: 15 }
  ];

  // Title Row (Row 1)
  const titleRow = worksheet.addRow(['Prestressed Concrete Structures']);
  worksheet.mergeCells('A1:D1');
  titleRow.font = { name: 'Arial', size: 16, bold: true };
  titleRow.alignment = { horizontal: 'center' };

  // Subtitle Row (Row 2)
  const subRow = worksheet.addRow(['Professor: Dr. Ashish Akhare', '', '', `Date: ${formattedDate}`]);
  worksheet.mergeCells('A2:C2');
  subRow.font = { name: 'Arial', size: 12, bold: true };

  // Empty Row
  worksheet.addRow([]);

  // Attendance Title Row (Row 4)
  const attTitleRow = worksheet.addRow([attendanceTitle]);
  worksheet.mergeCells('A4:D4');
  attTitleRow.font = { name: 'Arial', size: 14, bold: true };
  attTitleRow.alignment = { horizontal: 'center' };

  // Empty Row
  worksheet.addRow([]);

  // Headers (Row 6)
  const headerRow = worksheet.addRow(['Sr. No.', 'MIS', 'Name of Student', 'Status']);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };
  headerRow.eachCell((cell) => {
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
  });

  // Data
  let count = 1;
  studentsData.forEach(student => {
    const isPresent = presentStudents.includes(student.mis);
    const row = worksheet.addRow([
      count++,
      student.mis,
      student.name,
      isPresent ? 'Present' : 'Absent'
    ]);
    
    row.eachCell((cell, colNumber) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      if (colNumber === 1 || colNumber === 4) {
        cell.alignment = { horizontal: 'center' };
      }
      if (colNumber === 4) {
        if (cell.value === 'Present') {
          cell.font = { color: { argb: 'FF008000' }, bold: true };
        } else if (cell.value === 'Absent') {
          cell.font = { color: { argb: 'FFFF0000' }, bold: true };
        }
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Attendance_${date}.xlsx`);
};

export const generateStatisticsExcel = async (stats, totalClasses) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Statistics');

  worksheet.columns = [
    { key: 'srNo', width: 10 },
    { key: 'mis', width: 20 },
    { key: 'name', width: 40 },
    { key: 'attended', width: 20 },
    { key: 'percentage', width: 15 }
  ];

  // Title Row (Row 1)
  const titleRow = worksheet.addRow(['Prestressed Concrete Structures - Attendance Report']);
  worksheet.mergeCells('A1:E1');
  titleRow.font = { name: 'Arial', size: 16, bold: true };
  titleRow.alignment = { horizontal: 'center' };

  // Subtitle Row (Row 2)
  const subRow = worksheet.addRow(['Professor: Dr. Ashish Akhare']);
  worksheet.mergeCells('A2:E2');
  subRow.font = { name: 'Arial', size: 12, bold: true };

  // Total Classes Row (Row 3)
  const totalRow = worksheet.addRow([`Total Classes Conducted: ${totalClasses}`]);
  worksheet.mergeCells('A3:E3');
  totalRow.font = { name: 'Arial', size: 12, bold: true };

  // Empty Row
  worksheet.addRow([]);

  // Headers (Row 5)
  const headerRow = worksheet.addRow(['Sr No', 'MIS', 'Name', 'Classes Attended', 'Percentage']);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };
  headerRow.eachCell((cell) => {
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
  });

  stats.forEach(s => {
    const row = worksheet.addRow([
      s.srNo,
      s.mis,
      s.name,
      s.classesAttended,
      `${s.percentage}%`
    ]);
    
    row.eachCell((cell, colNumber) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      if (colNumber === 1 || colNumber === 4 || colNumber === 5) {
        cell.alignment = { horizontal: 'center' };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), 'Attendance_Report.xlsx');
};
