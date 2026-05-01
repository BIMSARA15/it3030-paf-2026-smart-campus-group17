# Build Stage: Uses the correct Maven + Java 21 Eclipse Temurin image
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Run Stage: Uses the lightweight Java 21 JRE
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

# The -Xmx300m flag limits Java to 300MB of RAM so Render doesn't kill it!
ENTRYPOINT ["java", "-Xmx300m", "-Xms150m", "-jar", "app.jar"]