package com.customersupport.auth.service;

import com.customersupport.auth.dto.CreateTicketRequest;
import com.customersupport.auth.dto.DashboardStats;
import com.customersupport.auth.dto.TicketResponse;
import com.customersupport.auth.entity.Ticket;
import com.customersupport.auth.entity.User;
import com.customersupport.auth.repository.TicketRepository;
import com.customersupport.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TicketResponse createTicket(String userEmail, CreateTicketRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Please verify your email before creating tickets");
        }

        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setStatus("open");

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket created: {} by user: {}", savedTicket.getId(), userEmail);

        return new TicketResponse(savedTicket);
    }

    public List<TicketResponse> getUserTickets(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ticketRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(TicketResponse::new)
                .collect(Collectors.toList());
    }

    public TicketResponse getTicketById(Long ticketId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Security check: ensure user owns this ticket
        if (!ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return new TicketResponse(ticket);
    }

    @Transactional
    public TicketResponse updateTicketStatus(Long ticketId, String status, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        ticket.setStatus(status);
        Ticket updatedTicket = ticketRepository.save(ticket);
        log.info("Ticket {} status updated to: {}", ticketId, status);

        return new TicketResponse(updatedTicket);
    }

    @Transactional
    public TicketResponse addAiResponse(Long ticketId, String aiResponse, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        ticket.setAiResponse(aiResponse);
        Ticket updatedTicket = ticketRepository.save(ticket);

        return new TicketResponse(updatedTicket);
    }

    public DashboardStats getDashboardStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DashboardStats stats = new DashboardStats();
        stats.setTotalTickets(ticketRepository.countByUser(user));
        stats.setOpenTickets(ticketRepository.countByUserAndStatus(user, "open"));
        stats.setInProgressTickets(ticketRepository.countByUserAndStatus(user, "in-progress"));
        stats.setResolvedTickets(ticketRepository.countByUserAndStatus(user, "resolved"));
        stats.setClosedTickets(ticketRepository.countByUserAndStatus(user, "closed"));

        // Get recent 5 tickets
        List<TicketResponse> recentTickets = ticketRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .limit(5)
                .map(TicketResponse::new)
                .collect(Collectors.toList());
        stats.setRecentTickets(recentTickets);

        return stats;
    }

    // Admin methods
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(TicketResponse::new)
                .collect(Collectors.toList());
    }

    // Agent methods
    public List<TicketResponse> getAllOpenTickets() {
        List<String> statuses = List.of("open", "in-progress", "resolved");
        return ticketRepository.findByStatusInOrderByCreatedAtDesc(statuses)
                .stream()
                .map(this::buildTicketResponseWithAgentName)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketResponse addAgentResponse(Long ticketId, String agentEmail, String response) {
        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setAgentResponse(response);
        if (ticket.getAssignedAgentId() == null) {
            ticket.setAssignedAgentId(agent.getId());
        }
        if ("open".equals(ticket.getStatus())) {
            ticket.setStatus("in-progress");
        }
        Ticket updatedTicket = ticketRepository.save(ticket);
        log.info("Agent {} responded to ticket {}", agentEmail, ticketId);

        return buildTicketResponseWithAgentName(updatedTicket);
    }

    @Transactional
    public TicketResponse assignTicket(Long ticketId, String agentEmail) {
        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setAssignedAgentId(agent.getId());
        if ("open".equals(ticket.getStatus())) {
            ticket.setStatus("in-progress");
        }
        Ticket updatedTicket = ticketRepository.save(ticket);
        log.info("Ticket {} assigned to agent {}", ticketId, agentEmail);

        return buildTicketResponseWithAgentName(updatedTicket);
    }

    @Transactional
    public TicketResponse updateTicketStatusByAgent(Long ticketId, String status) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);
        Ticket updatedTicket = ticketRepository.save(ticket);
        log.info("Ticket {} status updated to {} by agent", ticketId, status);

        return buildTicketResponseWithAgentName(updatedTicket);
    }

    private TicketResponse buildTicketResponseWithAgentName(Ticket ticket) {
        TicketResponse response = new TicketResponse(ticket);
        if (ticket.getAssignedAgentId() != null) {
            userRepository.findById(ticket.getAssignedAgentId())
                    .ifPresent(agent -> response.setAssignedAgentName(agent.getFullName()));
        }
        return response;
    }
}
