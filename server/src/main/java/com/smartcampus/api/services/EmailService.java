package com.smartcampus.api.services;

import com.smartcampus.api.models.Booking;
import com.smartcampus.api.models.Ticket;
import com.smartcampus.api.models.User;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SpringTemplateEngine templateEngine;

    // --- 1. ORIGINAL PLAIN TEXT METHOD (Used by ReminderService) ---
    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("your-project-email@gmail.com");
        mailSender.send(message);
    }

    // --- 2. HTML METHOD FOR BOOKINGS ---
    public void sendBookingHtmlEmail(Booking booking, String subject, String templateName) {
        try {
            Context context = new Context();
            context.setVariable("userName", booking.getUserName());
            context.setVariable("bookingId", booking.getId());
            context.setVariable("resourceId", booking.getResourceId());
            context.setVariable("date", booking.getDate());
            context.setVariable("startTime", booking.getStartTime());
            context.setVariable("endTime", booking.getEndTime());
            context.setVariable("purpose", booking.getPurpose());
            
            if (booking.getAdminNote() != null) {
                context.setVariable("adminNote", booking.getAdminNote());
            }

            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(booking.getUserEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom("your-project-email@gmail.com");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Failed to send Booking HTML email: " + e.getMessage());
        }
    }

    // --- 3. NEW HTML METHOD FOR TICKETS (Fixes the compile error!) ---
    public void sendTicketHtmlEmail(Ticket ticket, User user, String subject, String templateName) {
        try {
            Context context = new Context();
            // Map the specific Ticket variables required by the HTML templates
            context.setVariable("userName", user.getName());
            context.setVariable("ticketCode", ticket.getTicketCode());
            context.setVariable("issueTitle", ticket.getTitle());
            context.setVariable("status", ticket.getStatus().toString());
            context.setVariable("priority", ticket.getPriority().toString());
            
            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true); 
            helper.setFrom("your-project-email@gmail.com"); 

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Failed to send Ticket HTML email: " + e.getMessage());
        }
    }
}