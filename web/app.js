/**
 * EduPulse Pro - Modern Student Performance & Attendance Analyzer
 * Front-end Application Controller & Reactive Engine
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const SUBJECTS = ["Maths", "Science", "English", "History", "Computer"];
  const MAX_MARKS = 100;
  const DEFAULT_SAMPLE_STUDENTS = [
    { Roll: 1, Name: "Aarav Sen", Maths: 88, Science: 92, English: 79, History: 85, Computer: 95, ClassesHeld: 100, ClassesAttended: 94 },
    { Roll: 2, Name: "Diya Roy", Maths: 72, Science: 65, English: 80, History: 70, Computer: 68, ClassesHeld: 100, ClassesAttended: 82 },
    { Roll: 3, Name: "Kabir Das", Maths: 45, Science: 52, English: 38, History: 60, Computer: 55, ClassesHeld: 100, ClassesAttended: 66 },
    { Roll: 4, Name: "Meera Ghosh", Maths: 95, Science: 98, English: 91, History: 89, Computer: 99, ClassesHeld: 100, ClassesAttended: 97 },
    { Roll: 5, Name: "Rohan Paul", Maths: 58, Science: 49, English: 62, History: 55, Computer: 47, ClassesHeld: 100, ClassesAttended: 71 },
    { Roll: 6, Name: "Sneha Bose", Maths: 81, Science: 77, English: 85, History: 90, Computer: 83, ClassesHeld: 100, ClassesAttended: 88 },
    { Roll: 7, Name: "Tanmay Nag", Maths: 34, Science: 41, English: 29, History: 48, Computer: 39, ClassesHeld: 100, ClassesAttended: 58 },
    { Roll: 8, Name: "Isha Saha", Maths: 67, Science: 74, English: 70, History: 62, Computer: 78, ClassesHeld: 100, ClassesAttended: 79 }
  ];

  // --- App State ---
  let state = {
    students: [],
    attendanceThreshold: 75,
    activeChartTab: "performance",
    chartMetric: "total", // "total" | "percentage"
    chartSort: "desc",    // "desc" | "asc" | "roll"
    searchQuery: "",
    gradeFilter: "ALL",
    attendanceFilter: "ALL",
    sortColumn: "Roll",
    sortDirection: "asc",
    theme: localStorage.getItem("edupulse_theme") || "dark",
    isApiConnected: false,
    chartInstance: null
  };

  // --- DOM Elements ---
  const el = {
    html: document.documentElement,
    syncStatusBadge: document.getElementById("syncStatusBadge"),
    syncStatusText: document.getElementById("syncStatusText"),
    thresholdRange: document.getElementById("globalThresholdRange"),
    thresholdDisplay: document.getElementById("thresholdDisplay"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    openAddModalBtn: document.getElementById("openAddModalBtn"),
    searchInput: document.getElementById("searchInput"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    gradeFilterSelect: document.getElementById("gradeFilterSelect"),
    attendanceFilterSelect: document.getElementById("attendanceFilterSelect"),
    btnExportCsv: document.getElementById("btnExportCsv"),
    btnImportCsvModal: document.getElementById("btnImportCsvModal"),
    btnResetSample: document.getElementById("btnResetSample"),
    // KPIs
    kpiTotalStudents: document.getElementById("kpiTotalStudents"),
    kpiPassRateBadge: document.getElementById("kpiPassRateBadge"),
    kpiClassAverage: document.getElementById("kpiClassAverage"),
    kpiAverageGradeBadge: document.getElementById("kpiAverageGradeBadge"),
    kpiAverageAttendance: document.getElementById("kpiAverageAttendance"),
    kpiAttendanceHealthBadge: document.getElementById("kpiAttendanceHealthBadge"),
    kpiTopperName: document.getElementById("kpiTopperName"),
    kpiTopperScoreBadge: document.getElementById("kpiTopperScoreBadge"),
    kpiTopperDetail: document.getElementById("kpiTopperDetail"),
    kpiLowAttendanceCount: document.getElementById("kpiLowAttendanceCount"),
    kpiLowAttendanceBadge: document.getElementById("kpiLowAttendanceBadge"),
    cardAttendanceAlerts: document.getElementById("cardAttendanceAlerts"),
    // Charts
    chartTabs: document.querySelectorAll(".chart-tab"),
    metricButtons: document.querySelectorAll("#metricToggleGroup .btn-toggle"),
    sortButtons: document.querySelectorAll("#sortToggleGroup .btn-toggle"),
    btnDownloadChart: document.getElementById("btnDownloadChart"),
    mainChartCanvas: document.getElementById("mainChartCanvas"),
    // Subject Insights
    subjectCardsGrid: document.getElementById("subjectCardsGrid"),
    // Table
    studentsTable: document.getElementById("studentsTable"),
    studentsTableBody: document.getElementById("studentsTableBody"),
    tableFooterStats: document.getElementById("tableFooterStats"),
    tableEmptyState: document.getElementById("tableEmptyState"),
    resultsCountBadge: document.getElementById("resultsCountBadge"),
    tableFilterSummary: document.getElementById("tableFilterSummary"),
    btnClearFilters: document.getElementById("btnClearFilters"),
    tableHeaders: document.querySelectorAll(".students-table th.sortable"),
    // Dialogs
    studentDialog: document.getElementById("studentDialog"),
    studentForm: document.getElementById("studentForm"),
    modalStudentTitle: document.getElementById("modalStudentTitle"),
    editOriginalRoll: document.getElementById("editOriginalRoll"),
    formRoll: document.getElementById("formRoll"),
    formName: document.getElementById("formName"),
    formMaths: document.getElementById("formMaths"),
    formScience: document.getElementById("formScience"),
    formEnglish: document.getElementById("formEnglish"),
    formHistory: document.getElementById("formHistory"),
    formComputer: document.getElementById("formComputer"),
    formClassesHeld: document.getElementById("formClassesHeld"),
    formClassesAttended: document.getElementById("formClassesAttended"),
    rollErrorMsg: document.getElementById("rollErrorMsg"),
    previewTotal: document.getElementById("previewTotal"),
    previewPct: document.getElementById("previewPct"),
    previewGrade: document.getElementById("previewGrade"),
    previewAttendance: document.getElementById("previewAttendance"),
    btnCloseStudentModal: document.getElementById("btnCloseStudentModal"),
    btnCancelStudentModal: document.getElementById("btnCancelStudentModal"),
    // Report Card Dialog
    reportCardDialog: document.getElementById("reportCardDialog"),
    reportCardContent: document.getElementById("reportCardContent"),
    btnPrintReport: document.getElementById("btnPrintReport"),
    btnCloseReportModal: document.getElementById("btnCloseReportModal"),
    // CSV Import Dialog
    csvImportDialog: document.getElementById("csvImportDialog"),
    btnCloseImportModal: document.getElementById("btnCloseImportModal"),
    btnCancelImportModal: document.getElementById("btnCancelImportModal"),
    csvDropZone: document.getElementById("csvDropZone"),
    csvFileInput: document.getElementById("csvFileInput"),
    csvPreviewArea: document.getElementById("csvPreviewArea"),
    csvFileSnippet: document.getElementById("csvFileSnippet"),
    csvFileName: document.getElementById("csvFileName"),
    btnConfirmImportCsv: document.getElementById("btnConfirmImportCsv"),
    // Toast Container
    toastContainer: document.getElementById("toastContainer")
  };

  // --- Calculations Logic (Consistent with analyzer/calculations.py) ---
  function calculateGrade(percentage) {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    if (percentage >= 40) return "E";
    return "F";
  }

  function enrichStudent(student) {
    const maths = parseFloat(student.Maths) || 0;
    const science = parseFloat(student.Science) || 0;
    const english = parseFloat(student.English) || 0;
    const history = parseFloat(student.History) || 0;
    const computer = parseFloat(student.Computer) || 0;
    const held = parseInt(student.ClassesHeld, 10) || 1;
    const attended = parseInt(student.ClassesAttended, 10) || 0;

    const total = maths + science + english + history + computer;
    const average = Math.round((total / SUBJECTS.length) * 100) / 100;
    const percentage = Math.round((total / (MAX_MARKS * SUBJECTS.length) * 100) * 100) / 100;
    const grade = calculateGrade(percentage);
    const attendancePct = held > 0 ? Math.round((attended / held * 100) * 100) / 100 : 0;

    return {
      Roll: parseInt(student.Roll, 10),
      Name: String(student.Name).trim(),
      Maths: maths,
      Science: science,
      English: english,
      History: history,
      Computer: computer,
      ClassesHeld: held,
      ClassesAttended: attended,
      Total: total,
      Average: average,
      Percentage: percentage,
      Grade: grade,
      "Attendance%": attendancePct
    };
  }

  function getGradeClass(grade) {
    switch (grade) {
      case "A+": return "grade-A-plus";
      case "A": return "grade-A";
      case "B": return "grade-B";
      case "C": return "grade-C";
      case "D": return "grade-D";
      case "E": return "grade-E";
      default: return "grade-F";
    }
  }

  // --- Toast Notifications ---
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "success" 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    toast.innerHTML = `${icon}<span>${message}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // --- Data Loading & Synchronization ---
  async function loadData() {
    try {
      const res = await fetch("/api/students");
      if (res.ok) {
        const data = await res.json();
        state.isApiConnected = true;
        state.students = data.students.map(enrichStudent);
        updateSyncStatus(true, "Synced with students.csv");
        renderAll();
        return;
      }
    } catch (err) {
      // Backend not running (e.g. opened directly as file:// or offline)
    }

    // Fallback: LocalStorage
    state.isApiConnected = false;
    updateSyncStatus(false, "Local Storage Mode");
    const stored = localStorage.getItem("edupulse_students");
    if (stored) {
      try {
        state.students = JSON.parse(stored).map(enrichStudent);
      } catch (e) {
        state.students = DEFAULT_SAMPLE_STUDENTS.map(enrichStudent);
      }
    } else {
      state.students = DEFAULT_SAMPLE_STUDENTS.map(enrichStudent);
      saveLocalData();
    }
    renderAll();
  }

  function saveLocalData() {
    localStorage.setItem("edupulse_students", JSON.stringify(state.students));
  }

  function updateSyncStatus(connected, text) {
    el.syncStatusText.textContent = text;
    if (connected) {
      el.syncStatusBadge.style.color = "var(--color-success)";
      el.syncStatusBadge.style.borderColor = "rgba(16, 185, 129, 0.3)";
      el.syncStatusBadge.style.background = "rgba(16, 185, 129, 0.12)";
    } else {
      el.syncStatusBadge.style.color = "var(--color-warning)";
      el.syncStatusBadge.style.borderColor = "rgba(245, 158, 11, 0.3)";
      el.syncStatusBadge.style.background = "rgba(245, 158, 11, 0.12)";
    }
  }

  // --- Compute Summary Metrics ---
  function computeSummary() {
    const list = state.students;
    if (!list || list.length === 0) {
      return {
        total: 0,
        passRate: 0,
        classAvg: 0,
        avgGrade: "-",
        avgAttendance: 0,
        lowAttendanceCount: 0,
        topper: null,
        subjectStats: {}
      };
    }

    const totalStudents = list.length;
    const passedCount = list.filter(s => s.Grade !== "F").length;
    const passRate = Math.round((passedCount / totalStudents) * 100);

    const totalPct = list.reduce((acc, s) => acc + s.Percentage, 0);
    const classAvg = Math.round((totalPct / totalStudents) * 100) / 100;
    const avgGrade = calculateGrade(classAvg);

    const totalAtt = list.reduce((acc, s) => acc + s["Attendance%"], 0);
    const avgAttendance = Math.round((totalAtt / totalStudents) * 100) / 100;

    const lowAttendanceCount = list.filter(s => s["Attendance%"] < state.attendanceThreshold).length;

    // Overall Topper (by Total)
    const topper = list.slice().sort((a, b) => b.Total - a.Total)[0];

    // Subject statistics
    const subjectStats = {};
    for (const sub of SUBJECTS) {
      const scores = list.map(s => s[sub]);
      const sum = scores.reduce((a, b) => a + b, 0);
      const mean = Math.round((sum / totalStudents) * 100) / 100;
      const min = Math.min(...scores);
      const max = Math.max(...scores);

      // Std deviation
      const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (totalStudents > 1 ? totalStudents : 1);
      const std = Math.round(Math.sqrt(variance) * 100) / 100;

      // Topper for this subject
      const subTopper = list.slice().sort((a, b) => b[sub] - a[sub])[0];

      subjectStats[sub] = {
        mean, min, max, std,
        topperName: subTopper ? subTopper.Name : "N/A",
        topperScore: subTopper ? subTopper[sub] : 0
      };
    }

    return {
      total: totalStudents,
      passRate,
      classAvg,
      avgGrade,
      avgAttendance,
      lowAttendanceCount,
      topper,
      subjectStats
    };
  }

  // --- Rendering UI ---
  function renderAll() {
    renderKPIs();
    renderSubjectInsights();
    renderTable();
    renderChart();
  }

  function renderKPIs() {
    const s = computeSummary();
    el.kpiTotalStudents.textContent = s.total;
    el.kpiPassRateBadge.textContent = `${s.passRate}% Pass Rate`;

    el.kpiClassAverage.textContent = `${s.classAvg}%`;
    el.kpiAverageGradeBadge.textContent = `Grade ${s.avgGrade}`;
    el.kpiAverageGradeBadge.className = `kpi-badge ${getGradeClass(s.avgGrade)}`;

    el.kpiAverageAttendance.textContent = `${s.avgAttendance}%`;
    if (s.avgAttendance >= 75) {
      el.kpiAttendanceHealthBadge.textContent = "Healthy";
      el.kpiAttendanceHealthBadge.className = "kpi-badge badge-green";
    } else {
      el.kpiAttendanceHealthBadge.textContent = "Deficit";
      el.kpiAttendanceHealthBadge.className = "kpi-badge badge-rose";
    }

    if (s.topper) {
      el.kpiTopperName.textContent = s.topper.Name;
      el.kpiTopperScoreBadge.textContent = `${s.topper.Total} / 500 (${s.topper.Percentage}%)`;
      el.kpiTopperDetail.textContent = `Grade ${s.topper.Grade} • Top Ranked`;
    } else {
      el.kpiTopperName.textContent = "None";
      el.kpiTopperScoreBadge.textContent = "0 pts";
      el.kpiTopperDetail.textContent = "No student records";
    }

    el.kpiLowAttendanceCount.textContent = s.lowAttendanceCount;
    el.kpiLowAttendanceBadge.textContent = `< ${state.attendanceThreshold}%`;
    if (s.lowAttendanceCount > 0) {
      el.kpiLowAttendanceBadge.className = "kpi-badge badge-rose";
      el.cardAttendanceAlerts.classList.add("has-alerts");
    } else {
      el.kpiLowAttendanceBadge.className = "kpi-badge badge-green";
      el.cardAttendanceAlerts.classList.remove("has-alerts");
    }
  }

  function renderSubjectInsights() {
    const s = computeSummary();
    if (!s.subjectStats) return;

    el.subjectCardsGrid.innerHTML = "";
    for (const sub of SUBJECTS) {
      const stat = s.subjectStats[sub];
      if (!stat) continue;

      const card = document.createElement("article");
      card.className = "subject-card";
      card.innerHTML = `
        <div class="subject-header">
          <span class="subject-name">${sub}</span>
          <span class="subject-avg-badge">Avg: ${stat.mean}</span>
        </div>
        <div class="subject-stats-list">
          <div class="subject-stat-row">
            <span>Topper</span>
            <strong class="topper-highlight">${stat.topperName} (${stat.topperScore})</strong>
          </div>
          <div class="subject-stat-row">
            <span>Range (Min - Max)</span>
            <strong>${stat.min} - ${stat.max}</strong>
          </div>
          <div class="subject-stat-row">
            <span>Consistency (Std Dev)</span>
            <strong>&plusmn;${stat.std}</strong>
          </div>
        </div>
      `;
      el.subjectCardsGrid.appendChild(card);
    }
  }

  function getFilteredAndSortedStudents() {
    let list = state.students.slice();

    // 1. Text Search
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(s => 
        s.Name.toLowerCase().includes(q) || 
        String(s.Roll).includes(q)
      );
    }

    // 2. Grade Filter
    if (state.gradeFilter !== "ALL") {
      list = list.filter(s => s.Grade === state.gradeFilter);
    }

    // 3. Attendance Filter
    if (state.attendanceFilter === "LOW") {
      list = list.filter(s => s["Attendance%"] < state.attendanceThreshold);
    } else if (state.attendanceFilter === "GOOD") {
      list = list.filter(s => s["Attendance%"] >= state.attendanceThreshold);
    }

    // 4. Sorting
    const col = state.sortColumn;
    const dir = state.sortDirection === "asc" ? 1 : -1;

    list.sort((a, b) => {
      let valA = a[col];
      let valB = b[col];
      if (typeof valA === "string") {
        return valA.localeCompare(valB) * dir;
      }
      return (valA - valB) * dir;
    });

    return list;
  }

  function renderTable() {
    const list = getFilteredAndSortedStudents();
    el.studentsTableBody.innerHTML = "";

    // Results count
    el.resultsCountBadge.textContent = `${list.length} of ${state.students.length} students`;

    if (list.length === 0) {
      el.tableEmptyState.classList.remove("hidden");
      el.studentsTable.classList.add("hidden");
      return;
    }

    el.tableEmptyState.classList.add("hidden");
    el.studentsTable.classList.remove("hidden");

    // Header sort indicators
    el.tableHeaders.forEach(th => {
      const col = th.getAttribute("data-col");
      th.classList.remove("sort-asc", "sort-desc");
      if (col === state.sortColumn) {
        th.classList.add(state.sortDirection === "asc" ? "sort-asc" : "sort-desc");
      }
    });

    // Populate rows
    list.forEach(student => {
      const isLowAttendance = student["Attendance%"] < state.attendanceThreshold;
      const initial = student.Name.charAt(0).toUpperCase();
      const attendanceBarColor = isLowAttendance ? "fill-danger" : "fill-success";
      const scoreBarColor = student.Percentage >= 75 ? "fill-success" : (student.Percentage >= 50 ? "fill-info" : "fill-danger");

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="mono-val">#${student.Roll}</td>
        <td>
          <div class="student-profile">
            <span class="avatar-initial">${initial}</span>
            <span class="student-name-text">${student.Name}</span>
          </div>
        </td>
        <td class="text-center mono-val">${student.Maths}</td>
        <td class="text-center mono-val">${student.Science}</td>
        <td class="text-center mono-val">${student.English}</td>
        <td class="text-center mono-val">${student.History}</td>
        <td class="text-center mono-val">${student.Computer}</td>
        <td class="text-center mono-val"><strong>${student.Total}</strong></td>
        <td>
          <div class="progress-wrap">
            <span class="mono-val">${student.Percentage}%</span>
            <div class="mini-progress-bar">
              <div class="progress-fill ${scoreBarColor}" style="width: ${student.Percentage}%"></div>
            </div>
          </div>
        </td>
        <td class="text-center">
          <span class="badge-grade ${getGradeClass(student.Grade)}">${student.Grade}</span>
        </td>
        <td>
          <div class="progress-wrap">
            <span class="mono-val" style="color: ${isLowAttendance ? 'var(--color-danger)' : 'inherit'}; font-weight: ${isLowAttendance ? '700' : 'normal'}">
              ${student["Attendance%"]}%
            </span>
            <div class="mini-progress-bar">
              <div class="progress-fill ${attendanceBarColor}" style="width: ${Math.min(student["Attendance%"], 100)}%"></div>
            </div>
            ${isLowAttendance ? `<span title="Below ${state.attendanceThreshold}% warning threshold" style="color: var(--color-danger)">⚠️</span>` : ''}
          </div>
        </td>
        <td class="text-right">
          <div class="row-actions-group">
            <button class="btn-row-action btn-view-report" data-roll="${student.Roll}" title="View Student Report Card">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </button>
            <button class="btn-row-action btn-edit-student" data-roll="${student.Roll}" title="Edit Student">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-row-action action-delete btn-delete-student" data-roll="${student.Roll}" title="Delete Student">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      el.studentsTableBody.appendChild(tr);
    });

    // Class average row in footer
    const s = computeSummary();
    if (s.total > 0) {
      el.tableFooterStats.innerHTML = `
        <tr style="background: var(--bg-surface); font-weight: 700;">
          <td colspan="2">CLASS BENCHMARK AVERAGE</td>
          <td class="text-center mono-val">${s.subjectStats.Maths?.mean || '-'}</td>
          <td class="text-center mono-val">${s.subjectStats.Science?.mean || '-'}</td>
          <td class="text-center mono-val">${s.subjectStats.English?.mean || '-'}</td>
          <td class="text-center mono-val">${s.subjectStats.History?.mean || '-'}</td>
          <td class="text-center mono-val">${s.subjectStats.Computer?.mean || '-'}</td>
          <td class="text-center mono-val">${Math.round(s.classAvg * 5 * 10) / 10}</td>
          <td class="mono-val text-center">${s.classAvg}%</td>
          <td class="text-center"><span class="badge-grade ${getGradeClass(s.avgGrade)}">${s.avgGrade}</span></td>
          <td class="mono-val text-center">${s.avgAttendance}%</td>
          <td></td>
        </tr>
      `;
    } else {
      el.tableFooterStats.innerHTML = "";
    }
  }

  // --- Interactive Chart Rendering (Chart.js) ---
  function renderChart() {
    if (typeof Chart === 'undefined') return;

    if (state.chartInstance) {
      state.chartInstance.destroy();
      state.chartInstance = null;
    }

    const isDark = state.theme === "dark";
    const textColor = isDark ? "#94a3b8" : "#475569";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";

    const ctx = el.mainChartCanvas.getContext("2d");
    const activeTab = state.activeChartTab;
    let chartConfig = null;

    if (activeTab === "performance") {
      // Bar chart of students sorted according to toggle
      let list = state.students.slice();
      if (state.chartSort === "desc") {
        list.sort((a, b) => (state.chartMetric === "total" ? b.Total - a.Total : b.Percentage - a.Percentage));
      } else if (state.chartSort === "asc") {
        list.sort((a, b) => (state.chartMetric === "total" ? a.Total - b.Total : a.Percentage - b.Percentage));
      } else {
        list.sort((a, b) => a.Roll - b.Roll);
      }

      const labels = list.map(s => s.Name);
      const dataValues = list.map(s => state.chartMetric === "total" ? s.Total : s.Percentage);
      const maxVal = state.chartMetric === "total" ? 500 : 100;

      // Color bars according to grade
      const colors = list.map(s => {
        if (s.Grade === "A+") return "rgba(234, 179, 8, 0.85)";
        if (s.Grade === "A") return "rgba(16, 185, 129, 0.85)";
        if (s.Grade === "B") return "rgba(56, 189, 248, 0.85)";
        if (s.Grade === "C") return "rgba(99, 102, 241, 0.85)";
        if (s.Grade === "D") return "rgba(245, 158, 11, 0.85)";
        return "rgba(244, 63, 94, 0.85)";
      });

      chartConfig = {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: state.chartMetric === "total" ? "Total Marks (/500)" : "Score Percentage (%)",
            data: dataValues,
            backgroundColor: colors,
            borderRadius: 6,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                afterLabel: (ctx) => `Grade: ${list[ctx.dataIndex].Grade} | Attendance: ${list[ctx.dataIndex]["Attendance%"]}%`
              }
            }
          },
          scales: {
            x: {
              ticks: { color: textColor, font: { family: "'Plus Jakarta Sans', sans-serif" } },
              grid: { display: false }
            },
            y: {
              max: maxVal,
              ticks: { color: textColor },
              grid: { color: gridColor }
            }
          }
        }
      };

    } else if (activeTab === "subjects") {
      // Grouped comparison of Subject Mean, Min, Max
      const summary = computeSummary();
      const stats = summary.subjectStats;

      chartConfig = {
        type: "bar",
        data: {
          labels: SUBJECTS,
          datasets: [
            {
              label: "Subject Average",
              data: SUBJECTS.map(s => stats[s]?.mean || 0),
              backgroundColor: "rgba(99, 102, 241, 0.85)",
              borderRadius: 6
            },
            {
              label: "Highest Score",
              data: SUBJECTS.map(s => stats[s]?.max || 0),
              backgroundColor: "rgba(16, 185, 129, 0.85)",
              borderRadius: 6
            },
            {
              label: "Lowest Score",
              data: SUBJECTS.map(s => stats[s]?.min || 0),
              backgroundColor: "rgba(244, 63, 94, 0.85)",
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: textColor } }
          },
          scales: {
            x: { ticks: { color: textColor }, grid: { display: false } },
            y: { max: 100, ticks: { color: textColor }, grid: { color: gridColor } }
          }
        }
      };

    } else if (activeTab === "attendance") {
      // Scatter/Bubble plot: Attendance% (X) vs Performance (Y)
      const dataPoints = state.students.map(s => ({
        x: s["Attendance%"],
        y: s.Percentage,
        name: s.Name,
        grade: s.Grade
      }));

      chartConfig = {
        type: "scatter",
        data: {
          datasets: [{
            label: "Students",
            data: dataPoints,
            backgroundColor: dataPoints.map(p => p.x < state.attendanceThreshold ? "rgba(244, 63, 94, 0.9)" : "rgba(16, 185, 129, 0.9)"),
            pointRadius: 8,
            pointHoverRadius: 11
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const raw = ctx.raw;
                  return `${raw.name}: Attendance ${raw.x}% | Marks ${raw.y}% (${raw.grade})`;
                }
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: "Attendance Percentage (%)", color: textColor },
              min: 0,
              max: 100,
              ticks: { color: textColor },
              grid: { color: gridColor }
            },
            y: {
              title: { display: true, text: "Overall Percentage (%)", color: textColor },
              min: 0,
              max: 100,
              ticks: { color: textColor },
              grid: { color: gridColor }
            }
          }
        }
      };

    } else if (activeTab === "grades") {
      // Doughnut of Grade distribution
      const grades = ["A+", "A", "B", "C", "D", "E", "F"];
      const counts = grades.map(g => state.students.filter(s => s.Grade === g).length);
      const gradeColors = [
        "rgba(234, 179, 8, 0.85)",   // A+
        "rgba(16, 185, 129, 0.85)",  // A
        "rgba(56, 189, 248, 0.85)",  // B
        "rgba(99, 102, 241, 0.85)",  // C
        "rgba(245, 158, 11, 0.85)",  // D
        "rgba(249, 115, 22, 0.85)",  // E
        "rgba(244, 63, 94, 0.85)"    // F
      ];

      chartConfig = {
        type: "doughnut",
        data: {
          labels: grades.map(g => `Grade ${g}`),
          datasets: [{
            data: counts,
            backgroundColor: gradeColors,
            borderColor: isDark ? "#0f172a" : "#ffffff",
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "right", labels: { color: textColor } }
          }
        }
      };

    } else if (activeTab === "histogram") {
      // Score curve histogram in 10% bins: 0-9, 10-19... 90-100
      const bins = [
        "0-39% (F)", "40-49% (E)", "50-59% (D)", "60-69% (C)", 
        "70-79% (B)", "80-89% (A)", "90-100% (A+)"
      ];
      const counts = [
        state.students.filter(s => s.Percentage < 40).length,
        state.students.filter(s => s.Percentage >= 40 && s.Percentage < 50).length,
        state.students.filter(s => s.Percentage >= 50 && s.Percentage < 60).length,
        state.students.filter(s => s.Percentage >= 60 && s.Percentage < 70).length,
        state.students.filter(s => s.Percentage >= 70 && s.Percentage < 80).length,
        state.students.filter(s => s.Percentage >= 80 && s.Percentage < 90).length,
        state.students.filter(s => s.Percentage >= 90).length
      ];

      chartConfig = {
        type: "bar",
        data: {
          labels: bins,
          datasets: [{
            label: "Student Count",
            data: counts,
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor }, grid: { display: false } },
            y: {
              ticks: { color: textColor, stepSize: 1 },
              grid: { color: gridColor }
            }
          }
        }
      };
    }

    if (chartConfig) {
      state.chartInstance = new Chart(ctx, chartConfig);
    }
  }

  // --- Add / Edit Student Modal Operations ---
  function openAddStudentModal() {
    el.modalStudentTitle.textContent = "Add Student Record";
    el.editOriginalRoll.value = "";
    el.studentForm.reset();

    // Default next roll
    const maxRoll = state.students.reduce((max, s) => Math.max(max, s.Roll), 0);
    el.formRoll.value = maxRoll + 1;
    el.formRoll.disabled = false;
    el.formClassesHeld.value = 100;
    el.formClassesAttended.value = 85;
    el.rollErrorMsg.classList.add("hidden");

    updateFormPreview();
    el.studentDialog.showModal();
  }

  function openEditStudentModal(roll) {
    const student = state.students.find(s => s.Roll === roll);
    if (!student) return;

    el.modalStudentTitle.textContent = `Edit Student: ${student.Name}`;
    el.editOriginalRoll.value = student.Roll;
    el.formRoll.value = student.Roll;
    el.formRoll.disabled = true; // Roll is primary ID in edit mode
    el.formName.value = student.Name;
    el.formMaths.value = student.Maths;
    el.formScience.value = student.Science;
    el.formEnglish.value = student.English;
    el.formHistory.value = student.History;
    el.formComputer.value = student.Computer;
    el.formClassesHeld.value = student.ClassesHeld;
    el.formClassesAttended.value = student.ClassesAttended;
    el.rollErrorMsg.classList.add("hidden");

    updateFormPreview();
    el.studentDialog.showModal();
  }

  function updateFormPreview() {
    const maths = parseFloat(el.formMaths.value) || 0;
    const sci = parseFloat(el.formScience.value) || 0;
    const eng = parseFloat(el.formEnglish.value) || 0;
    const hist = parseFloat(el.formHistory.value) || 0;
    const comp = parseFloat(el.formComputer.value) || 0;
    const held = parseInt(el.formClassesHeld.value, 10) || 1;
    const att = parseInt(el.formClassesAttended.value, 10) || 0;

    const total = maths + sci + eng + hist + comp;
    const pct = Math.round((total / 500 * 100) * 10) / 10;
    const grade = calculateGrade(pct);
    const attPct = held > 0 ? Math.round((att / held * 100) * 10) / 10 : 0;

    el.previewTotal.textContent = `${total} / 500`;
    el.previewPct.textContent = `${pct}%`;
    el.previewGrade.textContent = grade;
    el.previewGrade.className = `badge-grade ${getGradeClass(grade)}`;
    el.previewAttendance.textContent = `${attPct}%`;
  }

  async function handleStudentFormSubmit(e) {
    e.preventDefault();

    const isEdit = Boolean(el.editOriginalRoll.value);
    const roll = parseInt(el.formRoll.value, 10);
    const name = el.formName.value.trim();

    if (!isEdit && state.students.some(s => s.Roll === roll)) {
      el.rollErrorMsg.classList.remove("hidden");
      return;
    }

    const held = parseInt(el.formClassesHeld.value, 10);
    const attended = parseInt(el.formClassesAttended.value, 10);

    if (attended > held) {
      alert("Classes attended cannot exceed total classes held.");
      return;
    }

    const payload = {
      Roll: roll,
      Name: name,
      Maths: parseFloat(el.formMaths.value),
      Science: parseFloat(el.formScience.value),
      English: parseFloat(el.formEnglish.value),
      History: parseFloat(el.formHistory.value),
      Computer: parseFloat(el.formComputer.value),
      ClassesHeld: held,
      ClassesAttended: attended
    };

    if (state.isApiConnected) {
      try {
        const url = isEdit ? `/api/students/${roll}` : "/api/students";
        const method = isEdit ? "PUT" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          state.students = data.students.map(enrichStudent);
          el.studentDialog.close();
          renderAll();
          showToast(isEdit ? `Updated ${name}` : `Added student ${name}`);
          return;
        } else {
          const err = await res.json();
          alert(`Server error: ${err.error || 'Failed to save'}`);
          return;
        }
      } catch (err) {
        console.warn("API request failed, falling back to local storage", err);
      }
    }

    // Local Storage Fallback
    const enriched = enrichStudent(payload);
    if (isEdit) {
      const idx = state.students.findIndex(s => s.Roll === roll);
      if (idx !== -1) state.students[idx] = enriched;
    } else {
      state.students.push(enriched);
    }
    saveLocalData();
    el.studentDialog.close();
    renderAll();
    showToast(isEdit ? `Updated ${name}` : `Added student ${name}`);
  }

  async function deleteStudent(roll) {
    const student = state.students.find(s => s.Roll === roll);
    if (!student) return;

    if (!confirm(`Are you sure you want to remove ${student.Name} (Roll #${roll})?`)) {
      return;
    }

    if (state.isApiConnected) {
      try {
        const res = await fetch(`/api/students/${roll}`, { method: "DELETE" });
        if (res.ok) {
          const data = await res.json();
          state.students = data.students.map(enrichStudent);
          renderAll();
          showToast(`Removed ${student.Name}`);
          return;
        }
      } catch (err) {
        console.warn("API request failed", err);
      }
    }

    state.students = state.students.filter(s => s.Roll !== roll);
    saveLocalData();
    renderAll();
    showToast(`Removed ${student.Name}`);
  }

  // --- Official Report Card Generator ---
  function openReportCard(roll) {
    const student = state.students.find(s => s.Roll === roll);
    if (!student) return;

    const summary = computeSummary();
    const isLowAtt = student["Attendance%"] < state.attendanceThreshold;

    let remarks = "";
    if (student.Grade === "A+") {
      remarks = "Outstanding academic performance and intellectual leadership across subjects. Demonstrates superior conceptual mastery.";
    } else if (student.Grade === "A") {
      remarks = "Excellent academic diligence and consistent high achievement. Commendable work ethic.";
    } else if (student.Grade === "B") {
      remarks = "Good overall grasp and steady progress. Targeted revision in lower-scoring subjects recommended to achieve top tier.";
    } else if (student.Grade === "C" || student.Grade === "D") {
      remarks = "Satisfactory effort, but requires focused remediation and regular guided study sessions.";
    } else {
      remarks = "Academic probation risk. Urgent remedial coaching required across multiple subjects.";
    }

    if (isLowAtt) {
      const needed = Math.ceil((state.attendanceThreshold * student.ClassesHeld / 100) - student.ClassesAttended);
      remarks += ` ⚠️ Attendance warning: Presence is currently ${student["Attendance%"]}%, below the institutional ${state.attendanceThreshold}% requirement. Must attend additional classes to satisfy semester eligibility.`;
    }

    el.reportCardContent.innerHTML = `
      <div class="report-student-meta">
        <div class="meta-field">
          <span>Student Name</span>
          <strong>${student.Name}</strong>
        </div>
        <div class="meta-field">
          <span>Roll Number</span>
          <strong>#${student.Roll}</strong>
        </div>
        <div class="meta-field">
          <span>Aggregate Percentage</span>
          <strong>${student.Percentage}%</strong>
        </div>
        <div class="meta-field">
          <span>Final Grade</span>
          <strong class="badge-grade ${getGradeClass(student.Grade)}">${student.Grade}</strong>
        </div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th class="text-center">Max Marks</th>
            <th class="text-center">Marks Scored</th>
            <th class="text-center">Class Average</th>
            <th>Performance Level</th>
          </tr>
        </thead>
        <tbody>
          ${SUBJECTS.map(sub => {
            const score = student[sub];
            const avg = summary.subjectStats[sub]?.mean || 0;
            const diff = Math.round((score - avg) * 10) / 10;
            const diffText = diff >= 0 ? `+${diff} above avg` : `${diff} below avg`;
            const diffColor = diff >= 0 ? "var(--color-success)" : "var(--color-danger)";
            return `
              <tr>
                <td><strong>${sub}</strong></td>
                <td class="text-center mono-val">${MAX_MARKS}</td>
                <td class="text-center mono-val"><strong>${score}</strong></td>
                <td class="text-center mono-val text-muted">${avg}</td>
                <td>
                  <span style="color: ${diffColor}; font-weight: 600; font-size: 0.78rem;">
                    ${diffText}
                  </span>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>

      <div class="report-student-meta" style="margin-bottom: 1.25rem;">
        <div class="meta-field">
          <span>Classes Held</span>
          <strong>${student.ClassesHeld}</strong>
        </div>
        <div class="meta-field">
          <span>Classes Attended</span>
          <strong>${student.ClassesAttended}</strong>
        </div>
        <div class="meta-field">
          <span>Attendance Rate</span>
          <strong style="color: ${isLowAtt ? 'var(--color-danger)' : 'var(--color-success)'}">
            ${student["Attendance%"]}%
          </strong>
        </div>
        <div class="meta-field">
          <span>Attendance Status</span>
          <strong style="color: ${isLowAtt ? 'var(--color-danger)' : 'var(--color-success)'}">
            ${isLowAtt ? 'Deficit Warning' : 'In Good Standing'}
          </strong>
        </div>
      </div>

      <div class="report-remarks-card">
        <h4>Faculty Observations & Guidance</h4>
        <p>${remarks}</p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px dashed var(--border-color); font-size: 0.78rem; color: var(--text-secondary);">
        <span>Date: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span>Authorized Academic Examination Seal &bull; EduPulse</span>
      </div>
    `;

    el.reportCardDialog.showModal();
  }

  // --- Reset Sample Data ---
  async function resetSampleData() {
    if (!confirm("Reset database to standard sample students? Any custom changes will be replaced.")) {
      return;
    }

    if (state.isApiConnected) {
      try {
        const res = await fetch("/api/reset-sample", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          state.students = data.students.map(enrichStudent);
          renderAll();
          showToast("Sample data loaded into CSV");
          return;
        }
      } catch (err) {
        console.warn("Failed to reset via API", err);
      }
    }

    state.students = DEFAULT_SAMPLE_STUDENTS.map(enrichStudent);
    saveLocalData();
    renderAll();
    showToast("Sample data restored locally");
  }

  // --- Export CSV ---
  function exportCsv() {
    if (state.isApiConnected) {
      window.location.href = "/api/export-csv";
      return;
    }

    // Client-side CSV generation
    const headers = ["Roll", "Name", ...SUBJECTS, "ClassesHeld", "ClassesAttended"];
    const rows = state.students.map(s => [
      s.Roll, `"${s.Name}"`, ...SUBJECTS.map(sub => s[sub]), s.ClassesHeld, s.ClassesAttended
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("CSV downloaded");
  }

  // --- CSV Import ---
  let pendingImportText = "";

  function handleCsvFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      pendingImportText = e.target.result;
      el.csvFileName.textContent = file.name;
      el.csvFileSnippet.textContent = pendingImportText.split("\n").slice(0, 5).join("\n") + "\n...";
      el.csvPreviewArea.classList.remove("hidden");
      el.btnConfirmImportCsv.disabled = false;
    };
    reader.readAsText(file);
  }

  async function confirmCsvImport() {
    if (!pendingImportText) return;

    if (state.isApiConnected) {
      try {
        const res = await fetch("/api/import-csv", {
          method: "POST",
          headers: { "Content-Type": "text/csv" },
          body: pendingImportText
        });
        if (res.ok) {
          const data = await res.json();
          state.students = data.students.map(enrichStudent);
          el.csvImportDialog.close();
          renderAll();
          showToast("CSV imported and synced with backend");
          return;
        } else {
          const err = await res.json();
          alert(`Import failed: ${err.error || 'Invalid CSV'}`);
          return;
        }
      } catch (err) {
        console.warn("API CSV import failed", err);
      }
    }

    // Client-side parser
    try {
      const lines = pendingImportText.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const parts = lines[i].split(",").map(p => p.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = parts[idx]; });
        parsed.push(enrichStudent(obj));
      }
      state.students = parsed;
      saveLocalData();
      el.csvImportDialog.close();
      renderAll();
      showToast(`Imported ${parsed.length} records`);
    } catch (e) {
      alert("Failed to parse CSV file: " + e.message);
    }
  }

  // --- Theme Toggle ---
  function applyTheme(theme) {
    state.theme = theme;
    el.html.setAttribute("data-theme", theme);
    localStorage.setItem("edupulse_theme", theme);
    renderChart();
  }

  function toggleTheme() {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  }

  // --- Event Bindings ---
  function setupEventListeners() {
    // Theme toggle
    el.themeToggleBtn.addEventListener("click", toggleTheme);

    // Attendance threshold slider
    el.thresholdRange.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      state.attendanceThreshold = val;
      el.thresholdDisplay.textContent = `${val}%`;
      renderKPIs();
      renderTable();
      if (state.activeChartTab === "attendance") renderChart();
    });

    // Search bar
    el.searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.trim();
      el.clearSearchBtn.style.display = state.searchQuery ? "block" : "none";
      renderTable();
    });

    el.clearSearchBtn.addEventListener("click", () => {
      el.searchInput.value = "";
      state.searchQuery = "";
      el.clearSearchBtn.style.display = "none";
      renderTable();
    });

    // Filters
    el.gradeFilterSelect.addEventListener("change", (e) => {
      state.gradeFilter = e.target.value;
      renderTable();
    });

    el.attendanceFilterSelect.addEventListener("change", (e) => {
      state.attendanceFilter = e.target.value;
      renderTable();
    });

    el.btnClearFilters.addEventListener("click", () => {
      el.searchInput.value = "";
      state.searchQuery = "";
      el.clearSearchBtn.style.display = "none";
      el.gradeFilterSelect.value = "ALL";
      state.gradeFilter = "ALL";
      el.attendanceFilterSelect.value = "ALL";
      state.attendanceFilter = "ALL";
      renderTable();
    });

    // Table header sort
    el.tableHeaders.forEach(th => {
      th.addEventListener("click", () => {
        const col = th.getAttribute("data-col");
        if (state.sortColumn === col) {
          state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        } else {
          state.sortColumn = col;
          state.sortDirection = col === "Roll" || col === "Name" ? "asc" : "desc";
        }
        renderTable();
      });
    });

    // Table row actions (event delegation)
    el.studentsTableBody.addEventListener("click", (e) => {
      const btnReport = e.target.closest(".btn-view-report");
      if (btnReport) {
        const roll = parseInt(btnReport.getAttribute("data-roll"), 10);
        openReportCard(roll);
        return;
      }

      const btnEdit = e.target.closest(".btn-edit-student");
      if (btnEdit) {
        const roll = parseInt(btnEdit.getAttribute("data-roll"), 10);
        openEditStudentModal(roll);
        return;
      }

      const btnDelete = e.target.closest(".btn-delete-student");
      if (btnDelete) {
        const roll = parseInt(btnDelete.getAttribute("data-roll"), 10);
        deleteStudent(roll);
        return;
      }
    });

    // Chart Tabs
    el.chartTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        el.chartTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        state.activeChartTab = tab.getAttribute("data-chart");
        renderChart();
      });
    });

    // Chart Metric Toggles
    el.metricButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        el.metricButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.chartMetric = btn.getAttribute("data-metric");
        renderChart();
      });
    });

    // Chart Sort Toggles
    el.sortButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        el.sortButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.chartSort = btn.getAttribute("data-sort");
        renderChart();
      });
    });

    // Download Chart as PNG
    el.btnDownloadChart.addEventListener("click", () => {
      const canvas = el.mainChartCanvas;
      const link = document.createElement("a");
      link.download = `edupulse-${state.activeChartTab}-chart.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Chart saved as PNG");
    });

    // Add Student Modal Open / Close
    el.openAddModalBtn.addEventListener("click", openAddStudentModal);
    el.btnCloseStudentModal.addEventListener("click", () => el.studentDialog.close());
    el.btnCancelStudentModal.addEventListener("click", () => el.studentDialog.close());

    // Live form inputs preview
    const formInputs = [
      el.formMaths, el.formScience, el.formEnglish, el.formHistory, el.formComputer,
      el.formClassesHeld, el.formClassesAttended
    ];
    formInputs.forEach(input => {
      input.addEventListener("input", updateFormPreview);
    });

    // Form submit
    el.studentForm.addEventListener("submit", handleStudentFormSubmit);

    // Report Card Dialog Close & Print
    el.btnCloseReportModal.addEventListener("click", () => el.reportCardDialog.close());
    el.btnPrintReport.addEventListener("click", () => window.print());

    // CSV Export
    el.btnExportCsv.addEventListener("click", exportCsv);

    // Sample Reset
    el.btnResetSample.addEventListener("click", resetSampleData);

    // CSV Import Modal
    el.btnImportCsvModal.addEventListener("click", () => {
      pendingImportText = "";
      el.csvPreviewArea.classList.add("hidden");
      el.btnConfirmImportCsv.disabled = true;
      el.csvImportDialog.showModal();
    });
    el.btnCloseImportModal.addEventListener("click", () => el.csvImportDialog.close());
    el.btnCancelImportModal.addEventListener("click", () => el.csvImportDialog.close());

    // Drag and drop CSV
    el.csvDropZone.addEventListener("click", () => el.csvFileInput.click());
    el.csvFileInput.addEventListener("change", (e) => {
      if (e.target.files.length) handleCsvFile(e.target.files[0]);
    });
    el.csvDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      el.csvDropZone.classList.add("drag-over");
    });
    el.csvDropZone.addEventListener("dragleave", () => {
      el.csvDropZone.classList.remove("drag-over");
    });
    el.csvDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      el.csvDropZone.classList.remove("drag-over");
      if (e.dataTransfer.files.length) handleCsvFile(e.dataTransfer.files[0]);
    });
    el.btnConfirmImportCsv.addEventListener("click", confirmCsvImport);

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== el.searchInput && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        el.searchInput.focus();
      }
    });
  }

  // --- App Initialization ---
  function init() {
    applyTheme(state.theme);
    setupEventListeners();
    loadData();
  }

  // Launch on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
