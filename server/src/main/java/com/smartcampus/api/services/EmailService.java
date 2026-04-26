// server/src/main/java/com/smartcampus/api/services/EmailService.java
package com.smartcampus.api.services;

import com.smartcampus.api.models.Booking;
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

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("your-project-email@gmail.com");
        mailSender.send(message);
    }

    public void sendBookingHtmlEmail(Booking booking, String subject, String templateName) {
        try {
            Context context = new Context();
            context.setVariable("userName", booking.getUserName());
            context.setVariable("bookingId", booking.getId());
            
            // Format Asset Name nicely
            String assetName = booking.getResourceName() != null ? booking.getResourceName() : booking.getResourceId();
            if (booking.getBlock() != null && booking.getLevel() != null) {
                assetName += " (Block " + booking.getBlock() + ", Level " + booking.getLevel() + ")";
            }
            context.setVariable("assetName", assetName);
            
            context.setVariable("date", booking.getDate());
            context.setVariable("startTime", booking.getStartTime());
            context.setVariable("endTime", booking.getEndTime());
            context.setVariable("purpose", booking.getPurpose());
            
            // New Extra Details
            context.setVariable("lecturer", booking.getLecturer());
            context.setVariable("reviewedBy", booking.getReviewedBy() != null ? booking.getReviewedBy() : "Admin Officer");
            context.setVariable("adminNote", booking.getAdminNote());
            context.setVariable("rejectionReason", booking.getRejectionReason());

            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(booking.getUserEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true); 
            helper.setFrom("your-project-email@gmail.com"); 

            mailSender.send(message);
            System.out.println("✅ HTML Email sent successfully to: " + booking.getUserEmail());
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send HTML email: " + e.getMessage());
        }
    }
}