package com.medicare.hospital_management.controller;

import com.medicare.hospital_management.model.Patient;
import com.medicare.hospital_management.repository.PatientRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientRepository patientRepository;

    public PatientController(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerPatient(@RequestBody Patient patient) {

        Optional<Patient> existingPatient =
                patientRepository.findByEmail(patient.getEmail());

        if (existingPatient.isPresent()) {
            return ResponseEntity.badRequest()
                    .body("Email already registered");
        }

        Patient savedPatient = patientRepository.save(patient);

        return ResponseEntity.ok(savedPatient);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginPatient(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        Optional<Patient> existingPatient = patientRepository.findByEmail(email);

        if (existingPatient.isEmpty() || !existingPatient.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        return ResponseEntity.ok(existingPatient.get());
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }
}