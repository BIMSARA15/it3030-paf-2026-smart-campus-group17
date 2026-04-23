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

    // 1. Inject the HTML Template Engine
    @Autowired
    private SpringTemplateEngine templateEngine;

    // --- KEEP YOUR OLD METHOD FOR REMINDERS ---
    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("your-project-email@gmail.com");
        mailSender.send(message);
    }

    // --- NEW METHOD FOR BEAUTIFUL HTML BOOKING EMAILS ---
    public void sendBookingHtmlEmail(Booking booking, String subject, String templateName) {
        try {
            // 1. Prepare the dynamic data to inject into the HTML
            Context context = new Context();
            context.setVariable("userName", booking.getUserName());
            context.setVariable("bookingId", booking.getId());
            context.setVariable("resourceId", booking.getResourceId());
            context.setVariable("date", booking.getDate());
            context.setVariable("startTime", booking.getStartTime());
            context.setVariable("endTime", booking.getEndTime());
            context.setVariable("purpose", booking.getPurpose());
            
            // Add admin note if it exists
            if (booking.getAdminNote() != null) {
                context.setVariable("adminNote", booking.getAdminNote());
            }

            // 2. Process the HTML template with the data
            String htmlContent = templateEngine.process(templateName, context);

            // 3. Create a MimeMessage (which allows HTML styling)
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(booking.getUserEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // The 'true' flag means "This is HTML!"
            helper.setFrom("your-project-email@gmail.com"); // Make sure this matches your application.properties

            // 4. Send it!
            mailSender.send(message);
            System.out.println("✅ HTML Email sent successfully to: " + booking.getUserEmail());
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send HTML email: " + e.getMessage());
        }
    }
}