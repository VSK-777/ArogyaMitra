package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.repository.QueueTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final QueueTokenRepository queueTokenRepository;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public QueueToken generateToken(Appointment appointment) {
        Doctor doctor = appointment.getDoctor();
        LocalDate date = appointment.getAppointmentDate();

        Optional<QueueToken> lastTokenOpt = queueTokenRepository.findTopByDoctor_IdAndQueueDateOrderByTokenNumberDesc(doctor.getId(), date);
        int nextTokenNumber = lastTokenOpt.map(qt -> qt.getTokenNumber() + 1).orElse(1);

        QueueToken token = QueueToken.builder()
                .tokenId("TOKEN-" + doctor.getId() + "-" + date.toString() + "-" + nextTokenNumber)
                .tokenNumber(nextTokenNumber)
                .appointment(appointment)
                .doctor(doctor)
                .department(appointment.getDepartment())
                .hospital(appointment.getHospital())
                .queueDate(date)
                .status(TokenStatus.BOOKED)
                .build();

        return queueTokenRepository.save(token);
    }
}
