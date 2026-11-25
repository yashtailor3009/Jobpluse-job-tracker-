#!/usr/bin/env bash
# Quickstart script for Job Tracker & Career Analytics Dashboard
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
echo "=========================================================="
echo " Starting Job Tracker & Career Analytics Dashboard"
echo "=========================================================="

# Check Java Runtime
if [ -z "$JAVA_HOME" ]; then
    if [ -d "/Library/Java/JavaVirtualMachines/jdk-26.jdk/Contents/Home" ]; then
        export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-26.jdk/Contents/Home"
        export PATH="$JAVA_HOME/bin:$PATH"
    fi
fi

echo ">> Java Version: $(java -version 2>&1 | head -n 1)"
echo ">> Node Version: $(node -v)"
echo ">> NPM Version:  $(npm -v)"

echo ""
echo "Choose mode to run:"
echo "1) Docker Compose (Full Stack: MySQL + Spring Boot + React + Nginx)"
echo "2) Local Development (Spring Boot with H2 / MySQL + Vite dev server)"
read -p "Select [1 or 2]: " mode

if [ "$mode" == "1" ]; then
    echo ">> Launching via Docker Compose..."
    cd "$DIR"
    docker compose up --build
else
    echo ">> Starting Spring Boot Backend (in background)..."
    cd "$DIR/backend"
    if [ -f "./mvnw" ]; then
        ./mvnw spring-boot:run -Dspring-boot.run.profiles=local &
    elif which mvn >/dev/null 2>&1; then
        mvn spring-boot:run -Dspring-boot.run.profiles=local &
    else
        echo "Note: Maven or mvnw required to compile and start Spring Boot."
    fi
    BACKEND_PID=$!

    echo ">> Installing Frontend dependencies & starting Vite..."
    cd "$DIR/frontend"
    npm install
    npm run dev &
    FRONTEND_PID=$!

    echo ""
    echo ">> Apps are starting up!"
    echo "   - Frontend: http://localhost:5173"
    echo "   - Backend API: http://localhost:8080"
    echo "   - Swagger UI: http://localhost:8080/swagger-ui.html"
    echo "   - H2 Console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:jobtrackerdb)"
    echo "   - Demo credentials: demo@jobtracker.com / password123"
    echo ""
    echo "Press CTRL+C to terminate both servers."

    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
    wait
fi
