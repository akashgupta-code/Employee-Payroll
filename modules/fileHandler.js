// modules/fileHandler.js

// ── SALARY CALCULATIONS ──
// Uses "basicSalary" to match your employee.json field name
function calcSalary(basicSalary) {
  const basic = Number(basicSalary) || 0;
  const hra   = basic * 0.40;
  const da    = basic * 0.10;
  const pf    = basic * 0.12;
  const net   = basic + hra + da - pf;
  return { hra, da, pf, net };
}

// ── FORMAT to Indian Rupees ──
function fmtINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// ── ENRICH employee with computed salary fields ──
// Reads "basicSalary" (your actual field name in employee.json)
function enrichEmployee(emp) {
  const s = calcSalary(emp.basicSalary);  // fixed: was emp.salary
  return {
    ...emp,
    basicFmt: fmtINR(emp.basicSalary),    // fixed: was emp.salary
    hraFmt:   fmtINR(s.hra),
    daFmt:    fmtINR(s.da),
    pfFmt:    fmtINR(s.pf),
    netFmt:   fmtINR(s.net),
  };
}

// ── DASHBOARD STATS ──
// Reads "basicSalary" (your actual field name in employee.json)
function getStats(employees) {
  const totalPayroll = employees.reduce(
    (sum, e) => sum + calcSalary(e.basicSalary).net, 0  // fixed: was e.salary
  );
  const highest = employees.length
    ? Math.max(...employees.map(e => Number(e.basicSalary) || 0))  // fixed: was e.salary
    : 0;

  return {
    totalEmployees: employees.length,
    totalPayroll:   fmtINR(totalPayroll),
    highestSalary:  fmtINR(highest),
  };
}

module.exports = {
  calcSalary,
  fmtINR,
  enrichEmployee,
  getStats,
};