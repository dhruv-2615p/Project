@REM Maven Wrapper startup batch script for Windows
@echo off
SETLOCAL

SET WRAPPER_JAR="%~dp0.mvn\wrapper\maven-wrapper.jar"

@REM Find java.exe
IF NOT "%JAVA_HOME%"=="" (
    SET JAVA_EXE=%JAVA_HOME%\bin\java.exe
) ELSE (
    SET JAVA_EXE=java.exe
)

@REM Download wrapper jar if missing
IF NOT EXIST %WRAPPER_JAR% (
    echo Downloading Maven Wrapper...
    powershell -Command "(New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', '%~dp0.mvn\wrapper\maven-wrapper.jar')"
)

%JAVA_EXE% ^
  %MAVEN_OPTS% ^
  "-Dmaven.multiModuleProjectDirectory=%~dp0" ^
  -classpath %WRAPPER_JAR% ^
  org.apache.maven.wrapper.MavenWrapperMain %*

ENDLOCAL & set ERROR_CODE=%ERRORLEVEL%
CMD /C EXIT /B %ERROR_CODE%
