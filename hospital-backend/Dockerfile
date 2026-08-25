# ============================================
# Stage 1: Build the application with Maven
# ============================================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn package -DskipTests -B

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
ENTRYPOINT ["java", "-jar", "app.jar"]
