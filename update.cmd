REM goto current directory
cd /d %~dp0

REM Copy vendor files
XCOPY ..\..\Kidoju\Kidoju.Widgets\test\vendor\*.* .\test\vendor\ /C /E /I /R /Y
ATTRIB +R .\test\vendor\*