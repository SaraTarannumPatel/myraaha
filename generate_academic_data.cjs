const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const EXTRA_DATA_DIR = path.join(__dirname, 'docs', '17 SECTORS WITH THEIR 17000+ JOB ROLES', 'extra data points files');
const OUTPUT_FILE = path.join(__dirname, 'src', 'data', 'academic_exam_data.json');

(async () => {
  console.log("Starting academic & exam data compilation...");
  
  if (!fs.existsSync(EXTRA_DATA_DIR)) {
    console.error(`Directory not found: ${EXTRA_DATA_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(EXTRA_DATA_DIR).filter(f => f.endsWith('.xlsx'));
  
  const boards = {};
  const streams = {};
  const exams = {};
  const departments = {};
  const colleges = {};
  
  // Track relationship mapping
  const roleToExams = {};
  const roleToDept = {};
  const roleToColleges = {};

  files.forEach(file => {
    console.log(`Processing file: ${file}`);
    const filePath = path.join(EXTRA_DATA_DIR, file);
    const workbook = XLSX.readFile(filePath);
    
    // 1. Process School Boards & Stream Fitments
    if (workbook.SheetNames.includes('Board Stream Fitment')) {
      const boardData = XLSX.utils.sheet_to_json(workbook.Sheets['Board Stream Fitment']);
      boardData.forEach(row => {
        const boardName = row['Board'];
        if (!boards[boardName]) {
          boards[boardName] = { id: `board_${boardName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`, name: boardName, type: 'board', streams: [] };
        }
        
        const streamName = row['Stream'];
        if (streamName && !streams[streamName]) {
            streams[streamName] = { id: `stream_${streamName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`, name: streamName, type: 'academic_family' };
        }

        boards[boardName].streams.push({
          stream: streamName,
          bestFit: row['Best Fit (BF) Subjects'],
          forceFit: row['Force Fit (FF) Subjects'],
          noFit: row['No Fit (NF) Subjects']
        });
      });
    }
    
    // Process Board Notes
    if (workbook.SheetNames.includes('Board Notes')) {
      const boardNotes = XLSX.utils.sheet_to_json(workbook.Sheets['Board Notes']);
      // Try to attach notes to corresponding boards if possible (simple heuristic for now)
      boardNotes.forEach(row => {
          const note = row['Board-Level Subject Fitment Note'];
          if(note) {
              const matchedBoard = Object.keys(boards).find(b => note.includes(b));
              if (matchedBoard) {
                  boards[matchedBoard].note = note;
              }
          }
      });
    }

    // 2. Process Entrance Exams
    if (workbook.SheetNames.includes('Entrance Exams')) {
      const examData = XLSX.utils.sheet_to_json(workbook.Sheets['Entrance Exams']);
      examData.forEach(row => {
        const roleName = row['Role Name'];
        const examName = row['Entrance Exam Name'];
        
        if (examName && examName !== 'N/A' && examName !== 'None') {
          if (!exams[examName]) {
            exams[examName] = {
              id: `exam_${examName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
              name: examName,
              type: 'exam',
              scope: row['State / National'],
              level: row['Gateway Level'],
              roles: []
            };
          }
          if (roleName && !exams[examName].roles.includes(roleName)) {
             exams[examName].roles.push(roleName);
          }
          
          if(roleName) {
              if(!roleToExams[roleName]) roleToExams[roleName] = [];
              if(!roleToExams[roleName].includes(examName)) roleToExams[roleName].push(examName);
          }
        }
      });
    }

    // 3. Process Mapped University Departments & Eligibility Summary
    if (workbook.SheetNames.includes('Dept Reference')) {
      const deptData = XLSX.utils.sheet_to_json(workbook.Sheets['Dept Reference']);
      deptData.forEach(row => {
        const deptName = row['Mapped Department'];
        if (deptName && deptName !== 'N/A') {
            if (!departments[deptName]) {
                departments[deptName] = {
                    id: `dept_${deptName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
                    name: deptName,
                    type: 'department',
                    eligibility: row['Eligibility Summary'],
                    boardRequirement: row['Board-wise Subject Requirement'],
                    roles: []
                };
            }
        }
      });
    }
    
    // Link Roles to Departments using Stream Fitment
    if (workbook.SheetNames.includes('Stream Fitment')) {
        const streamFitData = XLSX.utils.sheet_to_json(workbook.Sheets['Stream Fitment']);
        streamFitData.forEach(row => {
            const roleName = row['Role Name'];
            const deptName = row['Mapped Department'];
            
            if(roleName && deptName && deptName !== 'N/A') {
                if (departments[deptName] && !departments[deptName].roles.includes(roleName)) {
                    departments[deptName].roles.push(roleName);
                }
                
                if(!roleToDept[roleName]) roleToDept[roleName] = [];
                if(!roleToDept[roleName].includes(deptName)) roleToDept[roleName].push(deptName);
            }
        });
    }

    // 4. Process Top Colleges
    if (workbook.SheetNames.includes('Top Colleges')) {
      const collegeData = XLSX.utils.sheet_to_json(workbook.Sheets['Top Colleges']);
      collegeData.forEach(row => {
        const roleName = row['Role Name'];
        const collegeName = row['College Name'];
        if (collegeName && collegeName !== 'N/A') {
          if (!colleges[collegeName]) {
            colleges[collegeName] = {
              id: `college_${collegeName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
              name: collegeName,
              type: 'college',
              affiliation: row['University Affiliation'],
              tier: row['College Tier'],
              associatedRoles: []
            };
          }
          if(roleName && !colleges[collegeName].associatedRoles.includes(roleName)) {
              colleges[collegeName].associatedRoles.push(roleName);
          }
          
          if(roleName) {
              if(!roleToColleges[roleName]) roleToColleges[roleName] = [];
              if(!roleToColleges[roleName].includes(collegeName)) roleToColleges[roleName].push(collegeName);
          }
        }
      });
    }
  });

  const outputData = {
    boards: Object.values(boards),
    streams: Object.values(streams),
    exams: Object.values(exams),
    departments: Object.values(departments),
    colleges: Object.values(colleges),
    roleMappings: {
        roleToExams,
        roleToDept,
        roleToColleges
    }
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
  console.log(`Successfully compiled academic data models and saved to ${OUTPUT_FILE}`);
})();
