package com.jobtracker.repository;

import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.Priority;
import com.jobtracker.entity.WorkType;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserId(Long userId);

    List<JobApplication> findByUserId(Long userId, Sort sort);

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, ApplicationStatus status);

    @Query("SELECT j FROM JobApplication j WHERE j.user.id = :userId " +
           "AND (:search IS NULL OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(j.location) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR j.status = :status) " +
           "AND (:priority IS NULL OR j.priority = :priority) " +
           "AND (:workType IS NULL OR j.workType = :workType) " +
           "ORDER BY j.dateApplied DESC, j.id DESC")
    List<JobApplication> filterApplications(
            @Param("userId") Long userId,
            @Param("search") String search,
            @Param("status") ApplicationStatus status,
            @Param("priority") Priority priority,
            @Param("workType") WorkType workType);

    @Query("SELECT j FROM JobApplication j WHERE j.user.id = :userId " +
           "AND j.deadline IS NOT NULL AND j.deadline >= :today " +
           "AND j.status NOT IN ('OFFER', 'REJECTED') " +
           "ORDER BY j.deadline ASC")
    List<JobApplication> findUpcomingDeadlines(
            @Param("userId") Long userId,
            @Param("today") LocalDate today);

    @Query("SELECT j FROM JobApplication j WHERE j.user.id = :userId " +
           "AND j.deadline IS NOT NULL AND j.deadline < :today " +
           "AND j.status = 'APPLIED' " +
           "ORDER BY j.deadline DESC")
    List<JobApplication> findOverdueDeadlines(
            @Param("userId") Long userId,
            @Param("today") LocalDate today);

    @Query("SELECT j.companyName, COUNT(j) FROM JobApplication j " +
           "WHERE j.user.id = :userId " +
           "GROUP BY j.companyName " +
           "ORDER BY COUNT(j) DESC")
    List<Object[]> findTopCompaniesByApplicationCount(@Param("userId") Long userId);

    @Query("SELECT j.status, COUNT(j) FROM JobApplication j " +
           "WHERE j.user.id = :userId " +
           "GROUP BY j.status")
    List<Object[]> countApplicationsByStatusGroup(@Param("userId") Long userId);

    @Query("SELECT j.dateApplied FROM JobApplication j " +
           "WHERE j.user.id = :userId")
    List<LocalDate> findAllApplicationDates(@Param("userId") Long userId);
}
