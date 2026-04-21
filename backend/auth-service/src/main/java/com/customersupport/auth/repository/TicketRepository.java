package com.customersupport.auth.repository;

import com.customersupport.auth.entity.Ticket;
import com.customersupport.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    List<Ticket> findByUserOrderByCreatedAtDesc(User user);
    
    List<Ticket> findByUserAndStatusOrderByCreatedAtDesc(User user, String status);
    
    @Query("SELECT t FROM Ticket t ORDER BY t.createdAt DESC")
    List<Ticket> findAllOrderByCreatedAtDesc();
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.user = ?1")
    long countByUser(User user);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.user = ?1 AND t.status = ?2")
    long countByUserAndStatus(User user, String status);

    List<Ticket> findByStatusInOrderByCreatedAtDesc(List<String> statuses);
}
