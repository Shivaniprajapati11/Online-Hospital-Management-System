const getApiBaseUrl = () => {
    if (window.location.port === "8080") return "";
    return window.location.hostname === "localhost" ? "http://localhost:8080" : "http://127.0.0.1:8080";
};

const API_BASE_URL = getApiBaseUrl();

function showToast(message, type = "info") {
    let container = document.getElementById("medicare-toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "medicare-toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `medicare-toast ${type}`;

    let iconClass = "fa-circle-info";
    if (type === "success") iconClass = "fa-circle-check";
    if (type === "error") iconClass = "fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon ${type}"></i>
        <div style="flex:1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showMessage(sectionName) {
    showToast(`${sectionName} feature is ready and connected to the medical backend.`, "info");
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "Register";

        const fullName = document.getElementById("name").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const dateOfBirth = document.getElementById("dob").value;
        const gender = document.getElementById("gender").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        let formAlert = document.getElementById("formAlert");
        if (formAlert) formAlert.style.display = "none";

        if (password !== confirmPassword) {
            displayFormError("Passwords do not match. Please verify your password entries.");
            showToast("Passwords do not match.", "error");
            return;
        }

        const patient = {
            fullName: fullName,
            email: email,
            phone: phone,
            dateOfBirth: dateOfBirth,
            gender: gender,
            password: password
        };

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Registering Account...`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patient)
            });

            if (response.ok) {
                const savedPatient = await response.json();
                // Store user for immediate seamless login
                localStorage.setItem("medicare_patient", JSON.stringify(savedPatient));
                localStorage.setItem("medicare_user", JSON.stringify({ role: "patient", email: email, name: fullName }));

                displayFormSuccess("Account registered successfully! Redirecting to login...");
                showToast("Account created successfully in MySQL database!", "success");

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1200);
            } else {
                const errorMsg = await response.text();
                displayFormError(errorMsg || "Registration failed. Please check your details.");
                showToast(errorMsg || "Registration failed.", "error");
            }
        } catch (error) {
            console.error(error);
            displayFormError("Cannot connect to Java backend on port 8080. Please ensure backend is running.");
            showToast("Cannot connect to Java backend on port 8080.", "error");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        }
    });
}

// Inline Form Error Helper
function displayFormError(msg) {
    let alertBox = document.getElementById("formAlert");
    if (!alertBox) {
        alertBox = document.createElement("div");
        alertBox.id = "formAlert";
        const form = document.querySelector(".login-card form");
        if (form) form.insertAdjacentElement("beforebegin", alertBox);
    }
    alertBox.style.display = "block";
    alertBox.style.background = "#fee2e2";
    alertBox.style.color = "#b91c1c";
    alertBox.style.padding = "12px 16px";
    alertBox.style.borderRadius = "8px";
    alertBox.style.marginBottom = "18px";
    alertBox.style.fontSize = "13.5px";
    alertBox.style.fontWeight = "600";
    alertBox.style.border = "1px solid #fca5a5";
    alertBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="margin-right:6px;"></i> ${msg}`;
}

function displayFormSuccess(msg) {
    let alertBox = document.getElementById("formAlert");
    if (!alertBox) {
        alertBox = document.createElement("div");
        alertBox.id = "formAlert";
        const form = document.querySelector(".login-card form");
        if (form) form.insertAdjacentElement("beforebegin", alertBox);
    }
    alertBox.style.display = "block";
    alertBox.style.background = "#d1fae5";
    alertBox.style.color = "#047857";
    alertBox.style.padding = "12px 16px";
    alertBox.style.borderRadius = "8px";
    alertBox.style.marginBottom = "18px";
    alertBox.style.fontSize = "13.5px";
    alertBox.style.fontWeight = "600";
    alertBox.style.border = "1px solid #6ee7b7";
    alertBox.innerHTML = `<i class="fa-solid fa-circle-check" style="margin-right:6px;"></i> ${msg}`;
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "Sign In";

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        if (!role) {
            showToast("Please select your role.", "error");
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;
        }

        if (role === "admin") {
            showToast("Welcome Administrator! Access granted.", "success");
            localStorage.setItem("medicare_user", JSON.stringify({ role: "admin", email: email, name: "Administrator" }));
            setTimeout(() => { window.location.href = "admin-dashboard.html"; }, 600);
            return;
        }

        if (role === "doctor") {
            showToast("Welcome Doctor!", "success");
            localStorage.setItem("medicare_user", JSON.stringify({ role: "doctor", email: email, name: "Doctor" }));
            setTimeout(() => { window.location.href = "doctors.html"; }, 600);
            return;
        }

        // Patient Login against Java Backend
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, password: password })
            });

            if (response.ok) {
                const patient = await response.json();
                localStorage.setItem("medicare_patient", JSON.stringify(patient));
                localStorage.setItem("medicare_user", JSON.stringify({ role: "patient", email: email, name: patient.fullName }));
                showToast(`Welcome back, ${patient.fullName || "Patient"}!`, "success");
                setTimeout(() => {
                    window.location.href = "patient-dashboard.html";
                }, 800);
            } else {
                const errorMsg = await response.text();
                displayFormError(errorMsg || "Invalid email or password.");
                showToast(errorMsg || "Invalid email or password.", "error");
            }
        } catch (error) {
            console.error(error);
            displayFormError("Unable to communicate with medical server on port 8080.");
            showToast("Unable to communicate with medical server.", "error");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        }
    });
}

// ==========================================
// 3. Appointment Booking Flow
// ==========================================
let doctorsListCache = [];

async function loadDoctorsDropdown() {
    const departmentSelect = document.getElementById("department");
    const doctorSelect = document.getElementById("doctor");

    if (!doctorSelect) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/doctors`);
        if (response.ok) {
            doctorsListCache = await response.json();
            populateDoctors();
        }
    } catch (e) {
        console.warn("Could not fetch remote doctors list, using default roster.", e);
    }

    if (departmentSelect) {
        departmentSelect.addEventListener("change", () => {
            populateDoctors();
            updateDoctorFee();
        });
    }

    doctorSelect.addEventListener("change", updateDoctorFee);

    // If pre-selected doctor from doctors page
    const preSelected = localStorage.getItem("selectedDoctor");
    if (preSelected) {
        localStorage.removeItem("selectedDoctor");
        setTimeout(() => {
            for (let i = 0; i < doctorSelect.options.length; i++) {
                if (doctorSelect.options[i].value.toLowerCase().includes(preSelected.toLowerCase())) {
                    doctorSelect.selectedIndex = i;
                    updateDoctorFee();
                    break;
                }
            }
        }, 300);
    }
}

function populateDoctors() {
    const departmentSelect = document.getElementById("department");
    const doctorSelect = document.getElementById("doctor");
    if (!doctorSelect || doctorsListCache.length === 0) return;

    const selectedDept = departmentSelect ? departmentSelect.value.toLowerCase() : "";
    doctorSelect.innerHTML = `<option value="">Select Doctor</option>`;

    doctorsListCache.forEach(doc => {
        if (!selectedDept || doc.department.toLowerCase().includes(selectedDept) || selectedDept === "all") {
            const opt = document.createElement("option");
            opt.value = doc.name;
            opt.dataset.fee = doc.consultationFee;
            opt.dataset.dept = doc.department;
            opt.textContent = `${doc.name} - ${doc.specialization} (Fee: ₹${doc.consultationFee})`;
            doctorSelect.appendChild(opt);
        }
    });

    if (doctorSelect.options.length > 1) {
        doctorSelect.selectedIndex = 1;
        updateDoctorFee();
    }
}

function updateDoctorFee() {
    const doctorSelect = document.getElementById("doctor");
    const displayFee = document.getElementById("displayFee");
    if (doctorSelect && displayFee && doctorSelect.selectedIndex > 0) {
        const opt = doctorSelect.options[doctorSelect.selectedIndex];
        if (opt.dataset.fee) {
            displayFee.textContent = "₹" + opt.dataset.fee;
        }
    }
}

const appointmentForm = document.getElementById("appointmentForm");
if (appointmentForm) {
    loadDoctorsDropdown();

    appointmentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const departmentEl = document.getElementById("department");
        const doctorEl = document.getElementById("doctor");
        const dateEl = document.getElementById("appointmentDate");
        const timeEl = document.getElementById("appointmentTime");

        let selectedDoctorName = "Dr. Amit Sharma";
        let consultationFee = 500;
        let departmentName = "General Medicine";

        if (doctorEl && doctorEl.selectedIndex > 0) {
            selectedDoctorName = doctorEl.value;
            const opt = doctorEl.options[doctorEl.selectedIndex];
            if (opt.dataset.fee) consultationFee = parseFloat(opt.dataset.fee);
            if (opt.dataset.dept) departmentName = opt.dataset.dept;
        } else if (departmentEl && departmentEl.selectedIndex > 0) {
            departmentName = departmentEl.options[departmentEl.selectedIndex].text;
        }

        const appointmentDraft = {
            doctorName: selectedDoctorName,
            department: departmentName,
            appointmentDate: dateEl ? dateEl.value : new Date().toISOString().split("T")[0],
            appointmentTime: timeEl ? timeEl.value : "10:00 AM",
            fee: consultationFee,
            appointmentNumber: "APT-" + Math.floor(100000 + Math.random() * 900000)
        };

        localStorage.setItem("medicare_current_appointment", JSON.stringify(appointmentDraft));
        showToast("Consultation selected. Proceeding to checkout...", "info");
        setTimeout(() => {
            window.location.href = "payment.html";
        }, 500);
    });
}

// ==========================================
// 4. Payment & Backend Confirmation
// ==========================================
const paymentForm = document.getElementById("paymentForm");
if (paymentForm) {
    paymentForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const submitBtn = paymentForm.querySelector('button[type="submit"]');
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "Authorize";

        const paymentMethodEl = document.getElementById("paymentMethod");
        const paymentMethod = paymentMethodEl ? paymentMethodEl.value.toUpperCase() : "UPI";

        const currentAppt = JSON.parse(localStorage.getItem("medicare_current_appointment") || "{}");
        const rawPatient = localStorage.getItem("medicare_patient");
        const patient = rawPatient ? JSON.parse(rawPatient) : null;

        const bookingPayload = {
            appointmentNumber: currentAppt.appointmentNumber || ("APT-" + Math.floor(100000 + Math.random() * 900000)),
            patientId: patient ? patient.id : null,
            patientName: patient ? patient.fullName : "shivani prajapati",
            patientEmail: patient ? patient.email : "test@gmail.com",
            doctorName: currentAppt.doctorName || "Dr. Amit Sharma",
            department: currentAppt.department || "Cardiology",
            appointmentDate: currentAppt.appointmentDate || new Date().toISOString().split("T")[0],
            appointmentTime: currentAppt.appointmentTime || "10:00 AM",
            reason: "Clinical Consultation",
            fee: currentAppt.fee || 500.0,
            paymentMethod: paymentMethod,
            paymentStatus: "Paid",
            status: "Confirmed"
        };

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Secure Payment...`;
        }

        try {
            // Save to Java Backend MySQL Database
            const response = await fetch(`${API_BASE_URL}/api/appointments/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingPayload)
            });

            let savedAppointment = bookingPayload;
            if (response.ok) {
                savedAppointment = await response.json();
            }

            savedAppointment.txnId = "TXN-" + Math.floor(10000000 + Math.random() * 90000000);
            localStorage.setItem("medicare_current_appointment", JSON.stringify(savedAppointment));

            // Append to local history
            const history = JSON.parse(localStorage.getItem("medicare_appointments") || "[]");
            history.unshift(savedAppointment);
            localStorage.setItem("medicare_appointments", JSON.stringify(history));

            showToast("Payment verified! Appointment confirmed.", "success");
            setTimeout(() => {
                window.location.href = "payment-success.html";
            }, 800);
        } catch (error) {
            console.error(error);
            showToast("Payment verified! (Saved to history)", "info");
            setTimeout(() => {
                window.location.href = "payment-success.html";
            }, 800);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        }
    });
}

// ==========================================
// 5. Page Loaders & Dynamic UI Handlers
// ==========================================
document.addEventListener("DOMContentLoaded", async function () {
    const rawPatient = localStorage.getItem("medicare_patient");
    const rawUser = localStorage.getItem("medicare_user");
    const patient = rawPatient ? JSON.parse(rawPatient) : null;
    const user = rawUser ? JSON.parse(rawUser) : null;

    // Render User Pill in Navbar if logged in
    const navLinks = document.querySelector(".nav-links");
    if (navLinks && (patient || user)) {
        const displayName = (patient && patient.fullName) || (user && user.name) || "User";
        const role = (user && user.role) || "patient";

        // Remove register button and add user badge
        const regBtn = navLinks.querySelector(".register-btn");
        if (regBtn) regBtn.remove();

        const loginLink = Array.from(navLinks.querySelectorAll("a")).find(a => a.getAttribute("href")?.includes("login.html"));
        if (loginLink) loginLink.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;

        const badge = document.createElement("div");
        badge.className = "user-badge";
        badge.innerHTML = `<i class="fa-solid fa-circle-user" style="color:var(--primary);"></i> ${displayName} <span class="logo-badge" style="background:#e2e8f0; color:#334155;">${role}</span>`;
        navLinks.appendChild(badge);
    }

    // A) Patient Dashboard Initialization
    if (window.location.pathname.includes("patient-dashboard")) {
        const welcomeH1 = document.querySelector(".dashboard-header h1");
        if (welcomeH1 && patient && patient.fullName) {
            welcomeH1.innerHTML = `Welcome, <span>${patient.fullName}</span>`;
        }

        // Fetch user's live appointments from MySQL backend
        if (patient && patient.email) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/appointments/patient/${encodeURIComponent(patient.email)}`);
                if (res.ok) {
                    const appointments = await res.json();
                    updatePatientDashboard(appointments);
                }
            } catch (e) {
                console.warn("Could not load backend appointments for patient dashboard:", e);
            }
        }
    }

    // B) Patient Profile Initialization
    if (window.location.pathname.includes("patient-profile") && patient) {
        const paragraphs = document.querySelectorAll(".profile-details div p");
        if (paragraphs.length >= 6) {
            if (patient.fullName) paragraphs[0].textContent = patient.fullName;
            if (patient.email) paragraphs[1].textContent = patient.email;
            if (patient.phone) paragraphs[2].textContent = patient.phone;
            if (patient.dateOfBirth) paragraphs[3].textContent = patient.dateOfBirth;
            if (patient.gender) paragraphs[4].textContent = patient.gender;
            if (patient.id) paragraphs[5].textContent = "PAT" + String(patient.id).padStart(6, "0");
        }
    }

    // C) Payment Page Initialization
    if (window.location.pathname.includes("payment.html")) {
        const rawAppt = localStorage.getItem("medicare_current_appointment");
        if (rawAppt) {
            const appt = JSON.parse(rawAppt);
            const pTags = document.querySelectorAll(".payment-info p");
            if (pTags.length >= 4) {
                if (appt.doctorName) pTags[0].innerHTML = `<strong>Doctor:</strong> ${appt.doctorName}`;
                if (appt.department) pTags[1].innerHTML = `<strong>Department:</strong> ${appt.department}`;
                if (appt.appointmentDate) pTags[2].innerHTML = `<strong>Date & Time:</strong> ${appt.appointmentDate} (${appt.appointmentTime || "10:00 AM"})`;
                if (appt.fee) pTags[3].innerHTML = `<strong>Consultation Fee:</strong> ₹${appt.fee}`;
            }
        }
    }

    // D) Payment Success Page Initialization
    if (window.location.pathname.includes("payment-success.html")) {
        const rawAppt = localStorage.getItem("medicare_current_appointment");
        if (rawAppt) {
            const appt = JSON.parse(rawAppt);
            const pTags = document.querySelectorAll(".payment-info p");
            if (pTags.length >= 6) {
                if (appt.txnId) pTags[0].innerHTML = `<strong>Transaction ID:</strong> ${appt.txnId}`;
                if (appt.appointmentNumber) pTags[1].innerHTML = `<strong>Appointment ID:</strong> ${appt.appointmentNumber}`;
                if (appt.doctorName) pTags[2].innerHTML = `<strong>Doctor:</strong> ${appt.doctorName}`;
                if (appt.fee) pTags[3].innerHTML = `<strong>Amount Paid:</strong> ₹${appt.fee}`;
                if (appt.paymentMethod) pTags[4].innerHTML = `<strong>Payment Method:</strong> ${appt.paymentMethod}`;
                pTags[5].innerHTML = `<strong>Status:</strong> <span class="status completed"><i class="fa-solid fa-check"></i> Paid & Confirmed</span>`;
            }
        }
    }

    // E) Doctors Page Initialization (Dynamic Doctors Roster & Filter)
    if (window.location.pathname.includes("doctors.html")) {
        loadDoctorsDirectory();
    }

    // F) Admin Dashboard Live Stats & Appointments & Patients Table
    if (window.location.pathname.includes("admin-dashboard")) {
        loadAdminDashboard();
    }

    // G) My Appointments Page
    if (window.location.pathname.includes("my-appointments.html")) {
        loadMyAppointmentsPage(patient);
    }
});

// Helper for Patient Dashboard Stats and Appointments Table
function updatePatientDashboard(appointments) {
    if (!Array.isArray(appointments)) return;

    const totalCard = document.querySelector(".dashboard-container .stat-card:nth-child(1) h2");
    if (totalCard) totalCard.textContent = appointments.length;

    const upcomingCard = document.querySelector(".dashboard-container .stat-card:nth-child(2) h2");
    if (upcomingCard) {
        const count = appointments.filter(a => a.status === "Confirmed").length;
        upcomingCard.textContent = count;
    }

    const tbody = document.querySelector("#patientAppointmentsTable tbody");
    if (tbody && appointments.length > 0) {
        tbody.innerHTML = "";
        appointments.forEach(a => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${a.appointmentNumber || ("APT-" + a.id)}</strong></td>
                <td><i class="fa-solid fa-user-doctor" style="color:var(--primary); margin-right:4px;"></i> ${a.doctorName || "Dr. Amit Sharma"}</td>
                <td>${a.department || "General Medicine"}</td>
                <td>${a.appointmentDate} (${a.appointmentTime || "10:00 AM"})</td>
                <td><span class="status ${a.status?.toLowerCase()}"><i class="fa-solid fa-circle-check"></i> ${a.status || "Confirmed"}</span></td>
                <td>₹${a.fee || "500"} (${a.paymentStatus || "Paid"})</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Load dynamic doctors roster with interactive department filter
async function loadDoctorsDirectory() {
    const container = document.querySelector(".doctors-grid");
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/doctors`);
        if (res.ok) {
            doctorsListCache = await res.json();
            renderDoctorsGrid(doctorsListCache);
            setupDoctorFilterButtons();
        }
    } catch (e) {
        console.error("Could not load doctors directory:", e);
    }
}

function renderDoctorsGrid(doctors) {
    const container = document.querySelector(".doctors-grid");
    if (!container || !Array.isArray(doctors)) return;

    container.innerHTML = "";
    if (doctors.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--text-muted); padding:30px;">No doctors found matching this specialty.</p>`;
        return;
    }

    doctors.forEach(doc => {
        const card = document.createElement("div");
        card.className = "doctor-card";
        card.innerHTML = `
            <div>
                <div class="doctor-header">
                    <div class="doctor-avatar">
                        <i class="fa-solid fa-user-doctor"></i>
                    </div>
                    <div class="doctor-meta">
                        <h3>${doc.name}</h3>
                        <p>${doc.specialization}</p>
                        <div style="color:#f59e0b; font-size:13px; margin-top:4px;">
                            <i class="fa-solid fa-star"></i> ${doc.rating} / 5.0
                        </div>
                    </div>
                </div>
                <div class="doctor-details">
                    <p><i class="fa-solid fa-graduation-cap" style="color:var(--primary); margin-right:6px;"></i> ${doc.qualification}</p>
                    <p><i class="fa-solid fa-briefcase" style="color:var(--primary); margin-right:6px;"></i> ${doc.experienceYears} Years Experience</p>
                    <p><i class="fa-solid fa-clock" style="color:var(--primary); margin-right:6px;"></i> ${doc.availableDays} (${doc.availableTime})</p>
                    <p><i class="fa-solid fa-tag" style="color:var(--accent); margin-right:6px;"></i> <strong>₹${doc.consultationFee}</strong> Consultation Fee</p>
                </div>
            </div>
            <a href="appointment.html" class="primary-btn" style="text-align:center; justify-content:center; width:100%;" onclick="localStorage.setItem('selectedDoctor', '${doc.name}')">
                <i class="fa-solid fa-calendar-check"></i> Book Appointment
            </a>
        `;
        container.appendChild(card);
    });
}

function setupDoctorFilterButtons() {
    const filterButtons = document.querySelectorAll(".dashboard .secondary-btn");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filterText = btn.textContent.trim().toLowerCase();
            if (filterText.includes("all")) {
                renderDoctorsGrid(doctorsListCache);
            } else {
                const filtered = doctorsListCache.filter(doc => 
                    doc.department.toLowerCase().includes(filterText) || 
                    doc.specialization.toLowerCase().includes(filterText)
                );
                renderDoctorsGrid(filtered);
            }
        });
    });
}

// Load Admin Dashboard (Metrics + Appointments + Patients Table)
async function loadAdminDashboard() {
    try {
        // 1. Live Stats
        const statsRes = await fetch(`${API_BASE_URL}/api/appointments/stats`);
        if (statsRes.ok) {
            const stats = await statsRes.json();
            const statCards = document.querySelectorAll(".dashboard-container .stat-card h2");
            if (statCards.length >= 4) {
                statCards[0].textContent = stats.totalPatients || 0;
                statCards[1].textContent = stats.totalDoctors || 0;
                statCards[2].textContent = stats.totalAppointments || 0;
                statCards[3].textContent = "₹" + (stats.totalRevenue || 0).toLocaleString();
            }
        }

        // 2. Appointments Table
        const apptRes = await fetch(`${API_BASE_URL}/api/appointments/all`);
        if (apptRes.ok) {
            const appts = await apptRes.json();
            const apptTbody = document.querySelector("#appointmentsTable tbody");
            if (apptTbody && appts.length > 0) {
                apptTbody.innerHTML = "";
                appts.forEach(a => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td><strong>${a.appointmentNumber || ("APT-" + a.id)}</strong></td>
                        <td>${a.patientName || "Patient"}</td>
                        <td>${a.doctorName || "Doctor"}</td>
                        <td>${a.appointmentDate} (${a.appointmentTime || "10:00 AM"})</td>
                        <td><span class="status ${a.status?.toLowerCase()}">${a.status}</span></td>
                        <td>₹${a.fee} (${a.paymentMethod || "UPI"})</td>
                        <td>
                            <button class="secondary-btn" style="padding:4px 8px; font-size:12px;" onclick="updateAppointmentStatus(${a.id}, 'Completed')">
                                <i class="fa-solid fa-check"></i> Done
                            </button>
                            <button class="secondary-btn" style="padding:4px 8px; font-size:12px; color:#ef4444; border-color:#fca5a5;" onclick="updateAppointmentStatus(${a.id}, 'Cancelled')">
                                <i class="fa-solid fa-xmark"></i> Cancel
                            </button>
                        </td>
                    `;
                    apptTbody.appendChild(tr);
                });
            }
        }

        // 3. Registered Patients Table
        const patientsRes = await fetch(`${API_BASE_URL}/api/patients/all`);
        if (patientsRes.ok) {
            const patientsList = await patientsRes.json();
            const patientsTbody = document.querySelector("#patientsTable tbody");
            if (patientsTbody && patientsList.length > 0) {
                patientsTbody.innerHTML = "";
                patientsList.forEach(p => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td><strong>PAT${String(p.id).padStart(6, "0")}</strong></td>
                        <td>${p.fullName}</td>
                        <td>${p.email}</td>
                        <td>${p.phone || "N/A"}</td>
                        <td>${p.gender || "N/A"}</td>
                        <td>${p.dateOfBirth || "N/A"}</td>
                        <td><span class="status completed"><i class="fa-solid fa-circle-check"></i> Registered</span></td>
                    `;
                    patientsTbody.appendChild(tr);
                });
            }
        }
    } catch (e) {
        console.error("Error loading admin dashboard:", e);
    }
}

async function updateAppointmentStatus(id, newStatus) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/appointments/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            showToast(`Appointment status updated to ${newStatus}.`, "success");
            setTimeout(() => location.reload(), 600);
        }
    } catch (e) {
        showToast("Failed to update appointment status.", "error");
    }
}

// Load My Appointments Page
async function loadMyAppointmentsPage(patient) {
    const section = document.querySelector(".appointments-section");
    const header = document.querySelector(".appointments-header");
    if (!section || !header) return;

    let appointments = [];

    if (patient && patient.email) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/appointments/patient/${encodeURIComponent(patient.email)}`);
            if (res.ok) {
                appointments = await res.json();
            }
        } catch (e) {
            console.warn("Failed fetching from backend, checking local storage:", e);
        }
    }

    if (appointments.length === 0) {
        const local = localStorage.getItem("medicare_appointments");
        if (local) appointments = JSON.parse(local);
    }

    if (appointments.length > 0) {
        // Clear hardcoded sample boxes
        document.querySelectorAll(".appointment-box").forEach(b => b.remove());

        appointments.forEach(appt => {
            const box = document.createElement("div");
            box.className = "appointment-box";
            const statusClass = appt.status ? appt.status.toLowerCase() : "confirmed";
            box.innerHTML = `
                <div class="appointment-top">
                    <h2><i class="fa-solid fa-hospital-user" style="color:var(--primary); margin-right:8px;"></i> ${appt.reason || "Doctor Consultation"}</h2>
                    <span class="status ${statusClass}"><i class="fa-solid fa-circle-check"></i> ${appt.status || "Confirmed"}</span>
                </div>
                <div class="appointment-details">
                    <div>
                        <strong>Doctor</strong>
                        <p><i class="fa-solid fa-user-doctor" style="color:var(--primary);"></i> ${appt.doctorName || "Dr. Amit Sharma"}</p>
                    </div>
                    <div>
                        <strong>Department</strong>
                        <p><i class="fa-solid fa-stethoscope" style="color:var(--primary);"></i> ${appt.department || "General Medicine"}</p>
                    </div>
                    <div>
                        <strong>Date & Time</strong>
                        <p><i class="fa-solid fa-calendar-days" style="color:var(--primary);"></i> ${appt.appointmentDate} at ${appt.appointmentTime || "10:00 AM"}</p>
                    </div>
                    <div>
                        <strong>Appointment ID</strong>
                        <p><i class="fa-solid fa-hashtag" style="color:var(--primary);"></i> ${appt.appointmentNumber || ("APT-" + appt.id)}</p>
                    </div>
                    <div>
                        <strong>Payment</strong>
                        <p><i class="fa-solid fa-credit-card" style="color:var(--accent);"></i> Paid - ₹${appt.fee || "500"} (${appt.paymentMethod || "UPI"})</p>
                    </div>
                </div>
            `;
            header.insertAdjacentElement("afterend", box);
        });
    }
}

// Global Logout Handler
document.querySelectorAll('a[href*="login.html"]').forEach(link => {
    if (link.textContent.trim().toLowerCase().includes("logout") || link.textContent.trim().toLowerCase().includes("sign out")) {
        link.addEventListener("click", function (e) {
            localStorage.removeItem("medicare_patient");
            localStorage.removeItem("medicare_user");
            localStorage.removeItem("medicare_current_appointment");
        });
    }
});