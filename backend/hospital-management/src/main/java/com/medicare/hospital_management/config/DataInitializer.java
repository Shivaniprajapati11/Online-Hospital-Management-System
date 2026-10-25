package com.medicare.hospital_management.config;

import com.medicare.hospital_management.model.Appointment;
import com.medicare.hospital_management.model.Doctor;
import com.medicare.hospital_management.repository.AppointmentRepository;
import com.medicare.hospital_management.repository.DoctorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public DataInitializer(DoctorRepository doctorRepository, AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public void run(String... args) {
        if (doctorRepository.count() == 0) {
            doctorRepository.saveAll(List.of(
                new Doctor("Dr. Amit Sharma", "Cardiologist", "Cardiology", "MBBS, MD, DM (Cardiology - AIIMS)", 15, 800.0, 4.9, "Mon - Fri", "09:00 AM - 02:00 PM", "doctor1.jpg"),
                new Doctor("Dr. Priya Mehta", "General Physician", "General Medicine", "MBBS, MD (Internal Medicine)", 11, 500.0, 4.8, "Mon - Sat", "10:00 AM - 04:00 PM", "doctor2.jpg"),
                new Doctor("Dr. Rahul Patil", "Orthopedic Surgeon", "Orthopedics", "MS (Ortho), M.Ch (Joint Replacement)", 14, 750.0, 4.9, "Tue - Sat", "11:00 AM - 05:00 PM", "doctor3.jpg"),
                new Doctor("Dr. Neha Shah", "Dermatologist", "Dermatology", "MBBS, MD (Dermatology & Venereology)", 9, 600.0, 4.7, "Mon - Fri", "02:00 PM - 07:00 PM", "doctor4.jpg"),
                new Doctor("Dr. Rajesh Verma", "Senior Neurologist", "Neurology", "MBBS, MD, DM (Neurology)", 18, 900.0, 5.0, "Mon - Thu", "10:00 AM - 03:00 PM", "doctor5.jpg"),
                new Doctor("Dr. Ananya Iyer", "Pediatric Specialist", "Pediatrics", "MBBS, DCH, DNB (Pediatrics)", 10, 550.0, 4.9, "Mon - Sat", "09:00 AM - 01:00 PM", "doctor6.jpg")
            ));
        }

        if (appointmentRepository.count() == 0) {
            Appointment a1 = new Appointment();
            a1.setAppointmentNumber("APT-202601");
            a1.setPatientEmail("test@gmail.com");
            a1.setPatientName("shivani prajapati");
            a1.setDoctorName("Dr. Amit Sharma");
            a1.setDepartment("Cardiology");
            a1.setAppointmentDate("2026-10-15");
            a1.setAppointmentTime("11:00 AM");
            a1.setReason("Routine Heart Health Checkup");
            a1.setFee(800.0);
            a1.setPaymentMethod("UPI");
            a1.setPaymentStatus("Paid");
            a1.setStatus("Confirmed");
            a1.setCreatedAt("2026-10-02 18:30");
            appointmentRepository.save(a1);

            Appointment a2 = new Appointment();
            a2.setAppointmentNumber("APT-202602");
            a2.setPatientEmail("test@gmail.com");
            a2.setPatientName("shivani prajapati");
            a2.setDoctorName("Dr. Priya Mehta");
            a2.setDepartment("General Medicine");
            a2.setAppointmentDate("2026-09-20");
            a2.setAppointmentTime("10:30 AM");
            a2.setReason("Seasonal Flu & Blood Test Consultation");
            a2.setFee(500.0);
            a2.setPaymentMethod("CARD");
            a2.setPaymentStatus("Paid");
            a2.setStatus("Completed");
            a2.setCreatedAt("2026-09-19 14:15");
            appointmentRepository.save(a2);
        }
    }
}
