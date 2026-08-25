# ============================================
# Stage 1: Build the application with Maven
# ============================================
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml first for dependency caching
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# If mvnw doesn't exist, use system Maven
RUN if [ -f mvnw ]; then chmod +x mvnw && ./mvnw dependency:go-offline -B; \
    else apt-get update && apt-get install -y maven && mvn dependency:go-offline -B; fi

# Copy source code
COPY src ./src

# Build the JAR (skip tests for faster builds; tests run in CI)
RUN if [ -f mvnw ]; then ./mvnw package -DskipTests -B; \
    else mvn package -DskipTests -B; fi

# ============================================
# Stage 2: Production runtime image
# ============================================
FROM eclipse-temurin:21-jre

# Create a non-root user
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

WORKDIR /app

# Copy only the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

# Expose the default Spring Boot port
EXPOSE 8080

# Run the Spring Boot application
# PORT env var is read by Spring Boot via server.port=${PORT:8080}
ENTRYPOINT ["java", "-jar", "app.jar"]
