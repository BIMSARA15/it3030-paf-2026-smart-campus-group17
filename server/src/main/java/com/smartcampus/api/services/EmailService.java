package com.smartcampus.api.services;

import com.smartcampus.api.models.Booking;
import com.smartcampus.api.models.Ticket;
import com.smartcampus.api.models.User;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.springframework.core.io.ByteArrayResource;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String senderEmail;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");

    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom(senderEmail);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Plain text email failed: " + e.getMessage());
        }
    }

    public void sendBookingHtmlEmail(Booking booking, String subject, String templateName) {
        try {
            Context context = new Context();
            context.setVariable("userName", booking.getUserName());
            context.setVariable("bookingId", booking.getId());
            
            String cleanResourceName = booking.getResourceName() != null ? booking.getResourceName().replaceAll(" - Block null, Lvl null", "") : "Asset (" + booking.getResourceId() + ")";
            context.setVariable("assetName", cleanResourceName);
            
            String location = "";
            if (booking.getBlock() != null && !booking.getBlock().equalsIgnoreCase("null") && !booking.getBlock().trim().isEmpty()) {
                location += "Block " + booking.getBlock();
            }
            if (booking.getLevel() != null && !booking.getLevel().equalsIgnoreCase("null") && !booking.getLevel().trim().isEmpty()) {
                location += (location.isEmpty() ? "" : ", ") + "Level " + booking.getLevel();
            }
            context.setVariable("location", location);
            context.setVariable("attendees", booking.getAttendees());
            context.setVariable("specialRequests", booking.getSpecialRequests());
            
            context.setVariable("date", booking.getDate());
            context.setVariable("startTime", booking.getStartTime());
            context.setVariable("endTime", booking.getEndTime());
            context.setVariable("purpose", booking.getPurpose());
            context.setVariable("reviewedBy", booking.getReviewedBy() != null ? booking.getReviewedBy() : "System Admin");
            context.setVariable("createdAt", booking.getCreatedAt() != null ? booking.getCreatedAt().format(formatter) : "N/A");
            
            if (booking.getLecturer() != null && !booking.getLecturer().isEmpty()) {
                context.setVariable("lecturer", booking.getLecturer());
            }
            if (booking.getAdminNote() != null && !booking.getAdminNote().isEmpty()) {
                context.setVariable("adminNote", booking.getAdminNote());
            }
            if (booking.getRejectionReason() != null && !booking.getRejectionReason().isEmpty()) {
                context.setVariable("rejectionReason", booking.getRejectionReason());
            }
            if (booking.getCancellationReason() != null && !booking.getCancellationReason().isEmpty()) {
                context.setVariable("cancellationReason", booking.getCancellationReason());
            }

           String qrData = booking.getId(); 
String encodedQrData = URLEncoder.encode(qrData, StandardCharsets.UTF_8.toString());

// Added margins and high error correction (Q) so it scans instantly on mobile screens
String qrCodeUrl = "https://quickchart.io/qr?size=300x300&margin=2&ecLevel=Q&text=" + encodedQrData;
            context.setVariable("qrCodeUrl", qrCodeUrl);

            String htmlContent = templateEngine.process(templateName, context);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(booking.getUserEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom(senderEmail);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Failed to send Booking HTML email: " + e.getMessage());
        }
    }

    // FIX: Added 'String adminName' parameter so it successfully receives the Admin's name from BookingService
    public void sendAdminBookingHtmlEmail(Booking booking, String adminEmail, String adminName, String subject, String templateName) {
        try {
            Context context = new Context();
            context.setVariable("adminName", adminName != null ? adminName : "Admin");
            context.setVariable("requesterName", booking.getUserName());
            context.setVariable("requesterEmail", booking.getUserEmail());
            context.setVariable("requesterId", booking.getUserId());
            
            String cleanResourceName = booking.getResourceName() != null ? booking.getResourceName().replaceAll(" - Block null, Lvl null", "") : "Asset (" + booking.getResourceId() + ")";
            context.setVariable("assetName", cleanResourceName);
            
            String location = "";
            if (booking.getBlock() != null && !booking.getBlock().equalsIgnoreCase("null") && !booking.getBlock().trim().isEmpty()) {
                location += "Block " + booking.getBlock();
            }
            if (booking.getLevel() != null && !booking.getLevel().equalsIgnoreCase("null") && !booking.getLevel().trim().isEmpty()) {
                location += (location.isEmpty() ? "" : ", ") + "Level " + booking.getLevel();
            }
            context.setVariable("location", location);
            context.setVariable("attendees", booking.getAttendees());
            context.setVariable("specialRequests", booking.getSpecialRequests());

            context.setVariable("date", booking.getDate());
            context.setVariable("startTime", booking.getStartTime());
            context.setVariable("endTime", booking.getEndTime());
            context.setVariable("purpose", booking.getPurpose());
            context.setVariable("createdAt", booking.getCreatedAt() != null ? booking.getCreatedAt().format(formatter) : "N/A");
            
            if (booking.getLecturer() != null && !booking.getLecturer().isEmpty()) {
                context.setVariable("lecturer", booking.getLecturer());
            }

            String htmlContent = templateEngine.process(templateName, context);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(adminEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom(senderEmail);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Failed to send Admin HTML email: " + e.getMessage());
        }
    }

    public void sendTicketHtmlEmail(Ticket ticket, User user, String subject, String templateName) {
        try {
            Context context = new Context();
            context.setVariable("userName", user.getName());
            context.setVariable("ticketCode", ticket.getTicketCode());
            context.setVariable("issueTitle", ticket.getTitle());
            context.setVariable("description", ticket.getDescription()); 
            context.setVariable("status", ticket.getStatus().toString());
            context.setVariable("priority", ticket.getPriority().toString());
            context.setVariable("createdAt", ticket.getCreatedAt() != null ? ticket.getCreatedAt().format(formatter) : "N/A");
            
            String htmlContent = templateEngine.process(templateName, context);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true); 
            helper.setFrom(senderEmail); 
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Failed to send Ticket HTML email: " + e.getMessage());
        }
    }
}