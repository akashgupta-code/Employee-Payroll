const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const {
  enrichEmployee,
  getStats,
  calcSalary,
  fmtINR,
} = require("./modules/fileHandler");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ── EJS setup ──
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const filePath = path.join(__dirname, "employee.json");

// ─────────────────────────────────────────────
//  Helper functions  ← UNCHANGED
// ─────────────────────────────────────────────

const readEmployees = () => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath);
  return data.length ? JSON.parse(data) : [];
};

const writeEmployees = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// ─────────────────────────────────────────────
//  ORIGINAL API ROUTES  ← 100% UNCHANGED
// ─────────────────────────────────────────────

app.get("/employees", (req, res) => {
  res.json(readEmployees());
});

app.post("/employees", (req, res) => {
  const employees = readEmployees();
  const newEmployee = {
    id: Date.now(),
    name: req.body.name,
    department: req.body.department,
    basicSalary: Number(req.body.basicSalary),
  };
  employees.push(newEmployee);
  writeEmployees(employees);
  res.status(201).json(newEmployee);
});

app.delete("/employees/:id", (req, res) => {
  const id = req.params.id;
  const employees = readEmployees();
  const updatedEmployees = employees.filter((emp) => emp.id != id);
  writeEmployees(updatedEmployees);
  res.json({ message: "Employee deleted" });
});

app.put("/employees/:id", (req, res) => {
  const id = req.params.id;
  const employees = readEmployees();
  const index = employees.findIndex((emp) => emp.id == id);
  if (index === -1) {
    return res.status(404).json({ message: "Employee not found" });
  }
  employees[index] = {
    ...employees[index],
    name: req.body.name,
    department: req.body.department,
    basicSalary: Number(req.body.basicSalary),
  };
  writeEmployees(employees);
  res.json({ message: "Employee updated" });
});

// ─────────────────────────────────────────────
//  EJS PAGE ROUTES
// ─────────────────────────────────────────────

// GET /  →  Dashboard
app.get("/", (req, res) => {
  const raw = readEmployees();
  const enriched = raw.map(enrichEmployee); // now uses basicSalary correctly
  const stats = getStats(raw); // now uses basicSalary correctly

  res.render("index", {
    employees: enriched,
    stats,
    searchQuery: "",
    success: req.query.success || null,
    error: null,
  });
});

// GET /search  →  Filtered dashboard
// FIX: search now works on name, department and id correctly
app.get("/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase().trim();
  const raw = readEmployees();

  const filtered = q
    ? raw.filter(
        (e) =>
          String(e.id).toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q),
      )
    : raw;

  res.render("index", {
    employees: filtered.map(enrichEmployee),
    stats: getStats(raw), // always full stats regardless of search
    searchQuery: q,
    success: null,
    error: null,
  });
});

// GET /add  →  Add form
app.get("/add", (req, res) => {
  res.render("add", { error: null, formData: null });
});

// POST /add  →  Save new employee
app.post("/add", (req, res) => {
  const { name, department, basicSalary } = req.body;

  if (
    !name ||
    !department ||
    !basicSalary ||
    isNaN(Number(basicSalary)) ||
    Number(basicSalary) < 0
  ) {
    return res.render("add", {
      error:
        "All fields are required and salary must be a valid positive number.",
      formData: req.body,
    });
  }

  const employees = readEmployees();
  employees.push({
    id: Date.now(),
    name: name.trim(),
    department: department.trim(),
    basicSalary: Number(basicSalary),
  });
  writeEmployees(employees);
  res.redirect("/?success=Employee+added+successfully");
});

// GET /edit/:id  →  Edit form pre-filled
app.get("/edit/:id", (req, res) => {
  // FIX: use == (not ===) because id in JSON is a number, param is a string
  const emp = readEmployees().find((e) => e.id == req.params.id);
  if (!emp) return res.redirect("/");
  res.render("edit", { emp, error: null });
});

// POST /edit/:id  →  Update employee
app.post("/edit/:id", (req, res) => {
  const { name, department, basicSalary } = req.body;
  const id = req.params.id;

  if (
    !name ||
    !department ||
    !basicSalary ||
    isNaN(Number(basicSalary)) ||
    Number(basicSalary) < 0
  ) {
    const emp = readEmployees().find((e) => e.id == id) || { id, ...req.body };
    return res.render("edit", {
      emp,
      error:
        "All fields are required and salary must be a valid positive number.",
    });
  }

  const employees = readEmployees();
  const index = employees.findIndex((e) => e.id == id); // == handles string/number mismatch

  if (index !== -1) {
    employees[index] = {
      ...employees[index],
      name: name.trim(),
      department: department.trim(),
      basicSalary: Number(basicSalary),
    };
    writeEmployees(employees);
  }

  res.redirect("/?success=Employee+updated+successfully");
});

// GET /delete/:id  →  Delete employee
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const employees = readEmployees();
  writeEmployees(employees.filter((emp) => emp.id != id)); // != handles string/number mismatch
  res.redirect("/?success=Employee+deleted+successfully");
});

// GET /slip/:id  →  Salary slip
// FIX: was crashing because emp.id is a number but req.params.id is a string
app.get("/slip/:id", (req, res) => {
  const emp = readEmployees().find((e) => e.id == req.params.id); // == fixes the type mismatch
  if (!emp) return res.redirect("/");

  const s = calcSalary(emp.basicSalary); // fixed: was emp.salary (undefined)
  const now = new Date();

  res.render("slip", {
    emp,
    monthYr:
      now.toLocaleString("default", { month: "long" }) +
      " " +
      now.getFullYear(),
    genDate: now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    basicFmt: fmtINR(emp.basicSalary), // fixed: was emp.salary (undefined)
    hraFmt: fmtINR(s.hra),
    daFmt: fmtINR(s.da),
    pfFmt: fmtINR(s.pf),
    netFmt: fmtINR(s.net),
  });
});

// ─────────────────────────────────────────────
//  Start server  ← UNCHANGED
// ─────────────────────────────────────────────

app.listen(3000, () => {
  console.log("Server running on port http://localhost:3000");
});
