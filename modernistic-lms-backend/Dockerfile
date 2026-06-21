# ── Stage 1: Build ──────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Run ────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Render assigns a dynamic PORT via environment variable
EXPOSE 8080

# Run with production profile
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "-Dserver.port=${PORT:-8080}", "app.jar"]
