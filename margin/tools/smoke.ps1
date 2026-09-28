# Margin dev-build smoke gate (R1+). Keystroke-driven, disposable profile and fixtures.
# Usage: powershell -ExecutionPolicy Bypass -File margin\tools\smoke.ps1 -Tag r1
# Checks: launch, type + save, undo back to original bytes, terminal command, source control view.
# Writes screenshots and a result file to margin\evidence\<tag>-*.
param([string]$Tag = 'smoke', [int]$LaunchTimeout = 240)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$evidence = Join-Path $root 'margin\evidence'
$scratch = Join-Path $env:TEMP "margin-$Tag-$(Get-Date -Format yyyyMMdd-HHmmss)"
$fixtures = Join-Path $scratch 'fixtures'
New-Item -ItemType Directory -Force $fixtures, "$scratch\profile", "$scratch\ext" | Out-Null

$original = "# Smoke note`n`nFirst line of the note.`n"
$note = Join-Path $fixtures 'note.md'
[IO.File]::WriteAllText($note, $original)
git -C $fixtures init -q
git -C $fixtures -c user.name=smoke -c user.email=smoke@example.invalid add note.md
git -C $fixtures -c user.name=smoke -c user.email=smoke@example.invalid commit -q -m fixture

Add-Type -AssemblyName System.Windows.Forms, System.Drawing
$shell = New-Object -ComObject WScript.Shell
$results = [ordered]@{}

function Shot($name) {
	$bounds = [Windows.Forms.Screen]::PrimaryScreen.Bounds
	$bitmap = New-Object Drawing.Bitmap $bounds.Width, $bounds.Height
	$graphics = [Drawing.Graphics]::FromImage($bitmap)
	$graphics.CopyFromScreen($bounds.Location, [Drawing.Point]::Empty, $bounds.Size)
	$path = Join-Path $evidence "$Tag-$name.png"
	$bitmap.Save($path, [Drawing.Imaging.ImageFormat]::Png)
	$graphics.Dispose(); $bitmap.Dispose()
}

function Keys($keys, $pause = 400) {
	[void]$shell.AppActivate($script:windowPid)
	Start-Sleep -Milliseconds 150
	[Windows.Forms.SendKeys]::SendWait($keys)
	Start-Sleep -Milliseconds $pause
}

Push-Location $root
try {
	node build/lib/preLaunch.ts *> (Join-Path $evidence "$Tag-prelaunch.log")
	if ($LASTEXITCODE -ne 0) { throw 'preLaunch failed' }

	$env:VSCODE_SKIP_PRELAUNCH = '1'
	$launchArgs = "/c scripts\code.bat --user-data-dir `"$scratch\profile`" --extensions-dir `"$scratch\ext`" --disable-workspace-trust `"$fixtures`" `"$note`""
	$launcher = Start-Process cmd -ArgumentList $launchArgs -PassThru -WindowStyle Hidden `
		-RedirectStandardOutput (Join-Path $evidence "$Tag-launch.log") -RedirectStandardError (Join-Path $evidence "$Tag-launch.err.log")

	$deadline = (Get-Date).AddSeconds($LaunchTimeout)
	$window = $null
	while (-not $window -and (Get-Date) -lt $deadline) {
		Start-Sleep -Seconds 2
		$window = Get-Process | Where-Object { $_.MainWindowTitle -like '*note.md*' } | Select-Object -First 1
	}
	if (-not $window) { throw "No window titled *note.md* within $LaunchTimeout s" }
	$script:windowPid = $window.Id
	$results.launch = "PASS ($($window.MainWindowTitle))"
	Start-Sleep -Seconds 8
	Shot 'launch'

	# Type and save.
	Keys '^{END}'
	Keys 'Typed by the smoke gate.' 600
	Keys '^s' 1500
	$results.typeSave = if ((Get-Content $note -Raw) -match 'Typed by the smoke gate\.') { 'PASS' } else { 'FAIL' }

	# Undo back to the original bytes and save.
	for ($i = 0; $i -lt 30; $i++) { Keys '^z' 60 }
	Keys '^s' 1500
	$results.undo = if ((Get-Content $note -Raw) -ceq $original) { 'PASS' } else { 'FAIL' }

	# Terminal.
	Keys '^+`' 6000
	Keys 'echo ok > term.txt{ENTER}' 4000
	$results.terminal = if (Test-Path (Join-Path $fixtures 'term.txt')) { 'PASS' } else { 'FAIL' }
	Shot 'terminal'

	# Source control: the view opens and git sees the untracked terminal file.
	Keys '^+g' 3000
	Shot 'scm'
	$porcelain = git -C $fixtures status --porcelain
	$results.git = if ($porcelain -match 'term.txt') { 'PASS (view opened; see screenshot)' } else { 'FAIL' }
}
catch {
	$results.error = $_.Exception.Message
}
finally {
	Get-Process | Where-Object { $_.Path -like "$root\.build\electron\*" } | Stop-Process -Force -ErrorAction SilentlyContinue
	Pop-Location
	$results.scratch = $scratch
	$results | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $evidence "$Tag-smoke.json")
	$results | Format-List | Out-String | Write-Output
}
