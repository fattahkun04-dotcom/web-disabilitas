@echo off
echo ========================================
echo  PKDAC Docker Setup
echo ========================================
echo.

:menu
echo.
echo Choose an option:
echo 1. Build and Start all services
echo 2. Stop all services
echo 3. Stop and remove volumes (WARNING: deletes data)
echo 4. Rebuild app container
echo 5. View logs
echo 6. Run database migrations
echo 7. Seed database
echo 8. Check status
echo 9. Exit
echo.
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto clean
if "%choice%"=="4" goto rebuild
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto migrate
if "%choice%"=="7" goto seed
if "%choice%"=="8" goto status
if "%choice%"=="9" goto end
echo Invalid choice!
goto menu

:start
echo.
echo Starting all services...
docker-compose up -d
echo.
echo Waiting for MySQL to be ready...
timeout /t 10 /nobreak >nul
echo.
echo Application is running at: http://localhost:3000
echo Adminer (DB Admin): http://localhost:8080
pause
goto menu

:stop
echo.
echo Stopping all services...
docker-compose down
echo Done!
pause
goto menu

:clean
echo.
echo WARNING: This will delete all database data!
set /p confirm="Are you sure? (y/n): "
if /i not "%confirm%"=="y" goto menu
echo.
echo Stopping and removing volumes...
docker-compose down -v
echo Done!
pause
goto menu

:rebuild
echo.
echo Rebuilding app container...
docker-compose up -d --build app
echo Done!
pause
goto menu

:logs
echo.
echo Viewing app logs (Ctrl+C to exit)...
docker-compose logs -f app
goto menu

:migrate
echo.
echo Running database migrations...
docker-compose exec app npx prisma migrate dev
pause
goto menu

:seed
echo.
echo Seeding database...
docker-compose exec app npm run db:seed
echo Done!
pause
goto menu

:status
echo.
echo Service status:
docker-compose ps
pause
goto menu

:end
echo.
echo Thank you!
exit /b
