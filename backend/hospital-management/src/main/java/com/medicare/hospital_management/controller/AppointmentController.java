package com.medicare.hospital_management.controller;

import com.medicare.hospital_management.model.Appointment;
import com.medicare.hospital_management.repository.AppointmentRepository;
import com.medicare.hospital_management.repository.DoctorRepository;
import com.medicare.hospital_management.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentController(AppointmentRepository appointmentRepository,
                                 PatientRepository patientRepository,
                                 DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody Appointment appointment) {
        if (appointment.getAppointmentNumber() == null || appointment.getAppointmentNumber().trim().isEmpty()) {
            appointment.setAppointmentNumber("APT-" + (100000 + new Random().nextInt(900000)));
        }
        if (appointment.getStatus() == null || appointment.getStatus().trim().isEmpty()) {
            appointment.setStatus("Confirmed");
        }
        if (appointment.getPaymentStatus() == null || appointment.getPaymentStatus().trim().isEmpty()) {
            appointment.setPaymentStatus("Paid");
        }
        if (appointment.getCreatedAt() == null) {
            appointment.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }

        Appointment saved = appointmentRepository.save(appointment);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/patient/{email}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable String email) {
        return ResponseEntity.ok(appointmentRepository.findByPatientEmailOrderByAppointmentDateDesc(email));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentRepository.findAllByOrderByAppointmentDateDesc());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (appointmentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Appointment appt = appointmentOpt.get();
        String newStatus = statusUpdate.get("status");
        if (newStatus != null) {
            appt.setStatus(newStatus);
            appointmentRepository.save(appt);
        }
        return ResponseEntity.ok(appt);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();
        double totalRevenue = appointmentRepository.findAll().stream()
                .filter(a -> "Paid".equalsIgnoreCase(a.getPaymentStatus()))
                .mapToDouble(Appointment::getFee)
                .sum();

        stats.put("totalPatients", totalPatients);
        stats.put("totalDoctors", totalDoctors);
        stats.put("totalAppointments", totalAppointments);
        stats.put("totalRevenue", totalRevenue);
        return ResponseEntity.ok(stats);
    }
}
