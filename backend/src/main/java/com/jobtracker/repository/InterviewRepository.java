package com.jobtracker.repository;

import com.jobtracker.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByUserIdOrderByScheduledAtAsc(Long userId);

    List<Interview> findByJobApplicationIdAndUserIdOrderByScheduledAtAsc(Long jobApplicationId, Long userId);

    Optional<Interview> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT i FROM Interview i WHERE i.user.id = :userId " +
           "AND i.scheduledAt >= :now " +
           "ORDER BY i.scheduledAt ASC")
    List<Interview> findUpcomingInterviews(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    long countByUserId(Long userId);
}
