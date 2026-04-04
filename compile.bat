@echo off
cd /d "c:\Users\dhruv\OneDrive\Desktop\SEM 6\SWE\LAB\Project"
gcc -o tac_generator tac_generator.c
if %errorlevel% neq 0 (
    echo Compilation failed
    pause
    exit /b 1
)
echo Compilation successful
tac_generator test_input.c output.txt
if %errorlevel% neq 0 (
    echo Execution failed
    pause
    exit /b 1
)
echo Output file contents:
type output.txt
pause
