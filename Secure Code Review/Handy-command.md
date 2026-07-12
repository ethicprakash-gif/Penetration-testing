# Handy Commands — Everyday One-Liners

> Cool, practical Bash + PowerShell one-liners for daily work. Copy-paste ready.
> Run from wherever makes sense (usually the folder you're working in).

---

## Recursive Nested Archive Extraction (zip-inside-zip-inside-zip…)

**The scenario:** you get one `.zip`. Inside are folders and more `.zip`s. Inside *those* are more zips… all the way down. These commands keep extracting until nothing is left to extract, at any depth.

### 1. Extract every nested ZIP until the bottom (keep going while any remain)

```bash
while find . -name '*.zip' | grep -q .; do
  find . -name '*.zip' -print0 | while IFS= read -r -d '' z; do
    unzip -oq "$z" -d "${z%.zip}" && rm -f "$z"
  done
done
```
```powershell
do {
  $zips = Get-ChildItem -Recurse -Filter *.zip
  foreach ($z in $zips) {
    Expand-Archive $z.FullName -DestinationPath (Join-Path $z.DirectoryName $z.BaseName) -Force
    Remove-Item $z.FullName -Force
  }
} while ($zips)
```
Each pass unpacks the current zips into a folder named after the archive and deletes the archive; if that reveals new zips, the loop runs again. Terminates when zero zips remain.

### 2. Same, but for ANY archive type (zip, 7z, tar, gz, rar…) using 7-Zip

```bash
while find . -regextype posix-extended -iregex '.*\.(zip|7z|rar|tar|gz|bz2|xz|tgz)$' | grep -q .; do
  find . -regextype posix-extended -iregex '.*\.(zip|7z|rar|tar|gz|bz2|xz|tgz)$' -print0 |
  while IFS= read -r -d '' a; do 7z x -y -o"${a}_out" "$a" && rm -f "$a"; done
done
```
```powershell
do {
  $arc = Get-ChildItem -Recurse -Include *.zip,*.7z,*.rar,*.tar,*.gz,*.bz2,*.xz,*.tgz
  foreach ($a in $arc) { & 7z x -y "-o$($a.FullName)_out" $a.FullName; Remove-Item $a.FullName -Force }
} while ($arc)
```

### 3. Peek before you leap — list every archive & its depth first

```bash
find . -iname '*.zip' -printf '%d  %p\n' | sort -n
```
```powershell
Get-ChildItem -Recurse -Filter *.zip | Select FullName, @{n='Depth';e={($_.FullName -split '[\\/]').Count}} | Sort Depth
```

### 4. Count how many archives are lurking (all depths)

```bash
find . -iname '*.zip' | wc -l
```
```powershell
(Get-ChildItem -Recurse -Filter *.zip).Count
```

### 5. Safety valve — stop runaway extraction (zip-bomb guard)

```bash
# refuse to extract if total extracted size would exceed 5 GB
[ "$(du -sb . | cut -f1)" -lt 5000000000 ] && echo "safe to continue" || echo "STOP: too large"
```
```powershell
if ((Get-ChildItem -Recurse -File | Measure Length -Sum).Sum -lt 5GB) { 'safe' } else { 'STOP: too large' }
```

---

## Files & Folders

### 6. Flatten — move every file from nested folders into the current dir

```bash
find . -mindepth 2 -type f -exec mv -n -t . {} +
```
```powershell
Get-ChildItem -Recurse -File | Move-Item -Destination . -Force
```

### 7. Delete all empty folders (clean up after flattening)

```bash
find . -type d -empty -delete
```
```powershell
Get-ChildItem -Recurse -Directory | ? { -not (Get-ChildItem $_.FullName) } | Remove-Item
```

### 8. Biggest space hogs, top 20

```bash
du -ah . | sort -rh | head -20
```
```powershell
Get-ChildItem -Recurse -File | Sort Length -Desc | Select -First 20 FullName,@{n='MB';e={[math]::Round($_.Length/1MB,1)}}
```

### 9. Find duplicate files by content hash

```bash
find . -type f -exec sha256sum {} + | sort | awk '{if($1==p)print;p=$1}'
```
```powershell
Get-ChildItem -Recurse -File | Get-FileHash | Group Hash | ? Count -gt 1 | % { $_.Group.Path }
```

### 10. Bulk-rename: spaces → underscores

```bash
for f in *\ *; do mv -n "$f" "${f// /_}"; done
```
```powershell
Get-ChildItem | Rename-Item -NewName { $_.Name -replace ' ','_' }
```

### 11. Files changed in the last 24 hours

```bash
find . -type f -mtime -1
```
```powershell
Get-ChildItem -Recurse -File | ? LastWriteTime -gt (Get-Date).AddDays(-1)
```

### 12. Instantly back up a file before editing (`file` → `file.bak`)

```bash
cp -- file{,.bak}
```
```powershell
Copy-Item file "file.bak"
```

### 13. Directory tree, but skip the noise

```bash
tree -a -I 'node_modules|.git|dist'
```
```powershell
Get-ChildItem -Recurse -Directory | Select FullName
```

---

## Search & Text

### 14. Find which files contain a word

```bash
grep -rIl 'TODO' .
```
```powershell
Get-ChildItem -Recurse -File | Select-String 'TODO' | Select -Unique Path
```

### 15. Find-and-replace across every file in a folder

```bash
grep -rIl 'oldtext' . | xargs sed -i.bak 's/oldtext/newtext/g'
```
```powershell
Get-ChildItem -Recurse -File | % { (Get-Content $_) -replace 'oldtext','newtext' | Set-Content $_ }
```

### 16. Count lines of code (excluding blanks)

```bash
find . -name '*.py' | xargs grep -cve '^\s*$' | awk -F: '{s+=$2} END{print s}'
```
```powershell
(Get-ChildItem -Recurse *.py | Get-Content | ? { $_ -match '\S' }).Count
```

### 17. Top 10 most common lines in a file (log frequency)

```bash
sort file.log | uniq -c | sort -rn | head
```
```powershell
Get-Content file.log | Group | Sort Count -Desc | Select -First 10 Count,Name
```

### 18. Remove duplicate lines but keep original order

```bash
awk '!seen[$0]++' file
```
```powershell
Get-Content file | Select-Object -Unique
```

### 19. Show a file without comments or blank lines

```bash
grep -vE '^\s*(#|$)' config.conf
```
```powershell
Get-Content config.conf | ? { $_ -notmatch '^\s*(#|$)' }
```

---

## Data & Conversion

### 20. Pretty-print / minify JSON

```bash
jq . file.json          # pretty
jq -c . file.json       # minify
```
```powershell
Get-Content file.json | ConvertFrom-Json | ConvertTo-Json -Depth 20
```

### 21. Grab one field from a JSON API response

```bash
curl -s https://api.github.com/repos/torvalds/linux | jq -r '.stargazers_count'
```
```powershell
(Invoke-RestMethod https://api.github.com/repos/torvalds/linux).stargazers_count
```

### 22. CSV → column view in the terminal

```bash
column -t -s, file.csv | less -S
```
```powershell
Import-Csv file.csv | Format-Table -AutoSize
```

### 23. Base64 encode / decode on the fly

```bash
echo -n 'hello' | base64          # encode
echo 'aGVsbG8=' | base64 -d       # decode
```
```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('hello'))
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('aGVsbG8='))
```

---

## Network & Web

### 24. Spin up an instant web server for the current folder

```bash
python3 -m http.server 8000
```
```powershell
python -m http.server 8000   # or: npx serve .
```

### 25. What's my public IP?

```bash
curl -s ifconfig.me
```
```powershell
(Invoke-RestMethod ifconfig.me)
```

### 26. Is a port open on a host?

```bash
nc -zv example.com 443
```
```powershell
Test-NetConnection example.com -Port 443
```

### 27. Download a file with a progress bar

```bash
curl -# -O https://example.com/big.iso
```
```powershell
Invoke-WebRequest https://example.com/big.iso -OutFile big.iso
```

### 28. Check response time & status of a URL

```bash
curl -s -o /dev/null -w 'HTTP %{http_code}  %{time_total}s\n' https://example.com
```
```powershell
Measure-Command { Invoke-WebRequest https://example.com } | Select TotalSeconds
```

---

## System & Processes

### 29. What's eating my CPU / RAM? (top 10)

```bash
ps aux --sort=-%cpu | head -11
```
```powershell
Get-Process | Sort CPU -Desc | Select -First 10 Name,CPU,@{n='MB';e={[int]($_.WS/1MB)}}
```

### 30. Which process is using a port?

```bash
lsof -i :3000
```
```powershell
Get-NetTCPConnection -LocalPort 3000 | % { Get-Process -Id $_.OwningProcess }
```

### 31. Kill everything matching a name

```bash
pkill -f node
```
```powershell
Get-Process *node* | Stop-Process -Force
```

### 32. Free up disk — find the 20 largest files on the system

```bash
sudo find / -xdev -type f -printf '%s %p\n' 2>/dev/null | sort -rn | head -20
```
```powershell
Get-ChildItem C:\ -Recurse -File -EA 0 | Sort Length -Desc | Select -First 20 FullName,Length
```

---

## Productivity Tricks

### 33. Copy command output straight to the clipboard

```bash
some-command | xclip -sel clip        # Linux
some-command | pbcopy                 # macOS
```
```powershell
some-command | Set-Clipboard
```

### 34. Generate a strong random password

```bash
openssl rand -base64 20
```
```powershell
[Convert]::ToBase64String((1..20 | % { Get-Random -Max 256 }))
```

### 35. Generate a UUID

```bash
uuidgen
```
```powershell
[guid]::NewGuid().Guid
```

### 36. Time how long a command takes

```bash
time ./build.sh
```
```powershell
Measure-Command { ./build.ps1 }
```

### 37. Repeat a command every 2 seconds and watch it live

```bash
watch -n2 'ls -l | wc -l'
```
```powershell
while ($true) { Clear-Host; (Get-ChildItem).Count; Start-Sleep 2 }
```

### 38. Make a timestamped folder for today's work

```bash
mkdir -p "work_$(date +%Y-%m-%d)"
```
```powershell
New-Item -ItemType Directory "work_$(Get-Date -Format yyyy-MM-dd)"
```

### 39. Re-run the last command as root / elevated

```bash
sudo !!
```
```powershell
Start-Process pwsh -Verb RunAs   # then re-run your command
```

### 40. Jump back to the previous directory

```bash
cd -
```
```powershell
Set-Location -   # PowerShell 7+ (or: Pop-Location after Push-Location)
```

---

## One Command to Rule the Zip Chaos

Full workflow: drop your top-level zip in an empty folder, `cd` into it, then run block **#1** (or **#2** for mixed formats). When it finishes, flatten everything and clean up:

```bash
# 1) extract every nested zip to the bottom
while find . -name '*.zip' | grep -q .; do
  find . -name '*.zip' -print0 | while IFS= read -r -d '' z; do
    unzip -oq "$z" -d "${z%.zip}" && rm -f "$z"; done
done
# 2) (optional) collapse the tree and delete empty dirs
find . -mindepth 2 -type f -exec mv -n -t . {} + ; find . -type d -empty -delete
```
```powershell
do { $z = Get-ChildItem -Recurse -Filter *.zip
  foreach ($f in $z) { Expand-Archive $f.FullName (Join-Path $f.DirectoryName $f.BaseName) -Force; Remove-Item $f.FullName -Force } } while ($z)
Get-ChildItem -Recurse -File | Move-Item -Destination . -Force
Get-ChildItem -Recurse -Directory | ? { -not (Get-ChildItem $_.FullName) } | Remove-Item
```
