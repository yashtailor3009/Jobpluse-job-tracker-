# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom and fetch dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create directory for file uploads
RUN mkdir -p /app/uploads

COPY --from=build /app/target/job-tracker-backend-1.0.0.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=mysql

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
