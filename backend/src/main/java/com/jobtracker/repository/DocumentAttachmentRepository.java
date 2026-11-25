package com.jobtracker.repository;

import com.jobtracker.entity.DocumentAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentAttachmentRepository extends JpaRepository<DocumentAttachment, Long> {

    List<DocumentAttachment> findByJobApplicationIdAndUserId(Long jobApplicationId, Long userId);

    Optional<DocumentAttachment> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}
