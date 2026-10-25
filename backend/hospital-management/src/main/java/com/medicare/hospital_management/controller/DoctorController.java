package com.medicare.hospital_management.controller;

import com.medicare.hospital_management.model.Doctor;
import com.medicare.hospital_management.repository.DoctorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorRepository doctorRepository;

    public DoctorController(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors(@RequestParam(required = false) String department) {
        if (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("all")) {
            return ResponseEntity.ok(doctorRepository.findByDepartmentIgnoreCase(department));
        }
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Long id) {
        Optional<Doctor> doctor = doctorRepository.findById(id);
        if (doctor.isPresent()) {
            return ResponseEntity.ok(doctor.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorRepository.save(doctor));
    }
}
