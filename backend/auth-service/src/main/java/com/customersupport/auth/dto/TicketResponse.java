package com.customersupport.auth.dto;

import com.customersupport.auth.entity.Ticket;
import java.time.LocalDateTime;

public class TicketResponse {
    
    private Long id;
    private String userEmail;
    private String userName;
    private String category;
    private String priority;
    private String subject;
    private String description;
    private String status;
    private String aiResponse;
    private String agentResponse;
    private Long assignedAgentId;
    private String assignedAgentName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    public TicketResponse() {}

    public TicketResponse(Ticket ticket) {
        this.id = ticket.getId();
        this.userEmail = ticket.getUser().getEmail();
        this.userName = ticket.getUser().getFullName();
        this.category = ticket.getCategory();
        this.priority = ticket.getPriority();
        this.subject = ticket.getSubject();
        this.description = ticket.getDescription();
        this.status = ticket.getStatus();
        this.aiResponse = ticket.getAiResponse();
        this.agentResponse = ticket.getAgentResponse();
        this.assignedAgentId = ticket.getAssignedAgentId();
        this.createdAt = ticket.getCreatedAt();
        this.updatedAt = ticket.getUpdatedAt();
        this.resolvedAt = ticket.getResolvedAt();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public String getCategory() {
        return category;
    }

    public String getPriority() {
        return priority;
    }

    public String getSubject() {
        return subject;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    public String getAiResponse() {
        return aiResponse;
    }

    public String getAgentResponse() {
        return agentResponse;
    }

    public Long getAssignedAgentId() {
        return assignedAgentId;
    }

    public String getAssignedAgentName() {
        return assignedAgentName;
    }

    public void setAssignedAgentName(String assignedAgentName) {
        this.assignedAgentName = assignedAgentName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }
}
