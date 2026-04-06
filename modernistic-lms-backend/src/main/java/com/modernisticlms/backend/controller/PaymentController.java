package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.Payment;
import com.modernisticlms.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByUpdatedAtDesc();
    }

    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        payment.setId(null);
        return paymentRepository.save(payment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Long id, @RequestBody Payment updated) {
        return paymentRepository.findById(id)
                .map(payment -> {
                    payment.setStudentId(updated.getStudentId());
                    payment.setCourseId(updated.getCourseId());
                    payment.setAmount(updated.getAmount());
                    payment.setMethod(updated.getMethod());
                    payment.setStatus(updated.getStatus());
                    payment.setTransactionId(updated.getTransactionId());
                    payment.setDepositSlip(updated.getDepositSlip());
                    payment.setRefundReason(updated.getRefundReason());
                    return ResponseEntity.ok(paymentRepository.save(payment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        if (!paymentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        paymentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
