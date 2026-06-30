
## 1. XSS

```powershell
Get-ChildItem -Recurse | Select-String "dangerouslySetInnerHTML|innerHTML|outerHTML|document.write|insertAdjacentHTML|DOMParser|eval\(|new Function"
```

## 2. SQL Injection (backend code in same repo)

```powershell
Get-ChildItem -Recurse | Select-String "SELECT |INSERT |UPDATE |DELETE |query\(|execute\(|sequelize.query|knex.raw|raw\("
```

## 3. Command Injection

```powershell
Get-ChildItem -Recurse | Select-String "exec\(|execSync|spawn\(|spawnSync|fork\(|child_process"
```

## 4. SSRF

```powershell
Get-ChildItem -Recurse | Select-String "axios.get|axios.post|fetch\(|request\(|http.get|https.get|new URL"
```

## 5. Open Redirect

```powershell
Get-ChildItem -Recurse | Select-String "window.location|location.href|redirect|navigate\(|history.push|router.push"
```

## 6. JWT / Authentication

```powershell
Get-ChildItem -Recurse | Select-String "jwt|jsonwebtoken|Bearer|accessToken|refreshToken|idToken|Authorization"
```

## 7. Secrets / API Keys

```powershell
Get-ChildItem -Recurse | Select-String "password|secret|clientSecret|apiKey|privateKey|token"
```

## 8. Debug Logging

```powershell
Get-ChildItem -Recurse | Select-String "console.log|console.debug|logger.debug|debug\("
```

## 9. Security Headers

```powershell
Get-ChildItem -Recurse | Select-String "helmet|Content-Security-Policy|Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|Referrer-Policy|Permissions-Policy"
```

## 10. CORS

```powershell
Get-ChildItem -Recurse | Select-String "Access-Control-Allow-Origin|cors\(|origin:"
```

## 11. Cookie Security

```powershell
Get-ChildItem -Recurse | Select-String "HttpOnly|Secure|SameSite|cookie"
```

## 12. File Upload

```powershell
Get-ChildItem -Recurse | Select-String "multipart|FormData|multer|upload|file"
```

## 13. Path Traversal

```powershell
Get-ChildItem -Recurse | Select-String "readFile|writeFile|createReadStream|createWriteStream|path.join|path.resolve"
```

## 14. CSRF

```powershell
Get-ChildItem -Recurse | Select-String "csrf|xsrf|X-CSRF|X-XSRF"
```

## 15. Hardcoded URLs / Localhost

```powershell
Get-ChildItem -Recurse | Select-String "localhost|127.0.0.1|http://|https://"
```

---

### Faster approach 


```powershell
Get-ChildItem -Recurse |
Select-String "dangerouslySetInnerHTML|eval\(|innerHTML|outerHTML|document.write|exec\(|spawn\(|query\(|SELECT |INSERT |UPDATE |DELETE |accessToken|refreshToken|jwt|Bearer|password|secret|clientSecret|apiKey|console.log|logger.debug|helmet|Content-Security-Policy|X-Frame-Options|cors\(|HttpOnly|SameSite|Secure|csrf|fetch\(|axios|window.location|redirect|navigate\("
```

