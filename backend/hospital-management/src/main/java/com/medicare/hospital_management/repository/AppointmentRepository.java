package com.medicare.hospital_management.repository;

import com.medicare.hospital_management.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientEmailOrderByAppointmentDateDesc(String patientEmail);
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);
    List<Appointment> findAllByOrderByAppointmentDateDesc();
}
