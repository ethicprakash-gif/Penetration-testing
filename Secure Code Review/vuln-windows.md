# SAST / Secure Code Review — Windows (PowerShell)

> `Get-ChildItem` + `Select-String` patterns for source-code review on Windows. Run from the project root.
> Tip: append ` | Select-Object Path,LineNumber,Line` for cleaner output. Every hit is a triage lead, not a confirmed vuln.

---

## 1. Broad secret hunting

```powershell
Get-ChildItem -Recurse -File | Select-String -Pattern "password|passwd|secret|api[_-]?key|access[_-]?key|token|client[_-]?secret|credential|auth[_-]?token"
```

## 2. Cloud & provider keys

```powershell
Get-ChildItem -Recurse -File | Select-String -Pattern "AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|ghp_[0-9A-Za-z]{36}|gho_[0-9A-Za-z]{36}|glpat-[0-9A-Za-z_-]{20}|xox[baprs]-[0-9A-Za-z-]{10,}|sk_live_[0-9A-Za-z]{24,}|SG\.[0-9A-Za-z_-]{22}\.[0-9A-Za-z_-]{43}|AC[0-9a-f]{32}|sk-[A-Za-z0-9]{20,}|npm_[0-9A-Za-z]{36}"
```

## 3. Private keys & certificates

```powershell
Get-ChildItem -Recurse -File | Select-String -Pattern "BEGIN (RSA|EC|OPENSSH|PGP)? ?PRIVATE KEY|BEGIN CERTIFICATE|id_rsa"
Get-ChildItem -Recurse -Include *.pem,*.key,*.pfx,*.p12,*.jks,*.keystore
```

## 4. Hardcoded crypto keys / IVs / salts

```powershell
Get-ChildItem -Recurse -File | Select-String -Pattern "IV\s*=\s*[`"'][0-9a-f]{16,}|key\s*=\s*[`"'][0-9a-f]{16,}|salt\s*=\s*[`"']|SecretKeySpec\(|Encoding\.\w+\.GetBytes\("
```

## 5. JWTs / bearer tokens

```powershell
Get-ChildItem -Recurse -File | Select-String -Pattern "eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|Bearer |Authorization"
```

## 6. JWT weak validation

```powershell
Get-ChildItem -Recurse | Select-String -Pattern "algorithm.*none|verify\s*[:=]\s*false|jwt\.decode|ignoreExpiration\s*:\s*true|noTimestamp"
```

## 7. XSS (DOM / reflected)

```powershell
Get-ChildItem -Recurse | Select-String "dangerouslySetInnerHTML|innerHTML|outerHTML|document.write|insertAdjacentHTML|v-html|bypassSecurityTrust|\.html\("
```

## 8. Server-side template injection (SSTI)

```powershell
Get-ChildItem -Recurse | Select-String "render_template_string|Template\(|Jinja2|jinja|Velocity|Freemarker|Thymeleaf|new Template\("
```

## 9. SQL Injection

```powershell
Get-ChildItem -Recurse | Select-String "SELECT |INSERT |UPDATE |DELETE |query\(|execute\(|sequelize.query|knex.raw|rawQuery|createStatement|Statement.execute|SqlCommand\(|ExecuteReader"
```

## 10. NoSQL Injection

```powershell
Get-ChildItem -Recurse | Select-String "\`$where|mapReduce|\`$function|db\.\w+\.find\(|JSON.parse\(req\."
```

## 11. LDAP / XPath injection

```powershell
Get-ChildItem -Recurse | Select-String "DirContext|InitialDirContext|ldap.*filter|XPathExpression|xpath.compile|selectNodes\(|SelectNodes\("
```

## 12. Command Injection

```powershell
Get-ChildItem -Recurse | Select-String "exec\(|execSync|spawn\(|spawnSync|child_process|Runtime.getRuntime|ProcessBuilder|os.system|os.popen|subprocess|shell_exec|passthru|proc_open|Process.Start|exec.Command"
```

## 13. SSRF

```powershell
Get-ChildItem -Recurse | Select-String "axios.get|axios.post|fetch\(|request\(|http.get|https.get|new URL|urlopen|HttpClient|WebClient|RestTemplate|curl_setopt"
```

## 14. Path Traversal / arbitrary file read

```powershell
Get-ChildItem -Recurse | Select-String "\.\./|\.\.\\|readFile|createReadStream|sendFile|res.download|file_get_contents|fopen\(|new File|Path.Combine|os.path.join"
```

## 15. Zip Slip / archive extraction

```powershell
Get-ChildItem -Recurse | Select-String "ZipFile|ZipInputStream|getNextEntry|extractall|tarfile.open|entry.getName|ExtractToDirectory"
```

## 16. Insecure Deserialization

```powershell
Get-ChildItem -Recurse | Select-String "ObjectInputStream|readObject|XMLDecoder|BinaryFormatter|LosFormatter|JavaScriptSerializer|SoapFormatter|pickle.load|cPickle|marshal.load|yaml.load|unserialize|Marshal.load"
```

## 17. XXE / XML Parsers

```powershell
Get-ChildItem -Recurse | Select-String "DocumentBuilderFactory|SAXParserFactory|XMLReader|TransformerFactory|XmlDocument|XmlTextReader|etree.parse|lxml|expatreader|DOCTYPE|ENTITY"
```

## 18. Weak Cryptography

```powershell
Get-ChildItem -Recurse | Select-String "MD5|SHA1|DES|3DES|TripleDES|RC4|RC2|Blowfish|ECB|Math.random|mt_rand|createCipher|TLSv1|SSLv2|SSLv3|NullCipher"
```

## 19. Insecure randomness (non-CSPRNG for tokens)

```powershell
Get-ChildItem -Recurse | Select-String "Math.random.*(token|password|otp|nonce|session)|new Random\(|random.randint|random.choice|rand\(|srand\(|uuid1\("
```

## 20. Dangerous Functions / RCE

```powershell
Get-ChildItem -Recurse | Select-String "eval\(|new Function|assert\(|setTimeout\(.*['`"]|vm.runInContext|__import__|importlib|Assembly.Load|Activator.CreateInstance|Class.forName|reflect.Method|getMethod\("
```

## 21. Prototype Pollution (JS)

```powershell
Get-ChildItem -Recurse -Include *.js,*.ts | Select-String "__proto__|constructor\[|prototype\[|Object.assign\(.*req\.|deepMerge|lodash.merge|_\.merge"
```

## 22. Mass Assignment / over-posting

```powershell
Get-ChildItem -Recurse | Select-String "Object.assign\(.*req.body|new \w+\(req.body|ModelState|Bind\(|params.permit|attr_accessible|\.\.\.req.body"
```

## 23. IDOR / missing authorization indicators

```powershell
Get-ChildItem -Recurse | Select-String "findById\(req\.(params|query|body)|params\['id'\]|get_object_or_404" | Select-String -NotMatch "authorize|ability|policy|owner|current_user"
```

## 24. Disabled TLS / cert validation

```powershell
Get-ChildItem -Recurse | Select-String "verify=false|InsecureSkipVerify|rejectUnauthorized: false|VERIFY_PEER.*0|NODE_TLS_REJECT_UNAUTHORIZED|trustAllCerts|X509TrustManager|ALLOW_ALL_HOSTNAME|ServerCertificateValidationCallback|_create_unverified_context"
```

## 25. Debug / verbose mode in production

```powershell
Get-ChildItem -Recurse | Select-String "debug\s*=\s*true|DEBUG\s*[:=]\s*True|app.debug|flask.*debug=True|displayErrorDetails|whoops|printStackTrace|NODE_ENV.*development"
```

## 26. CORS misconfiguration

```powershell
Get-ChildItem -Recurse | Select-String "Access-Control-Allow-Origin.*\*|cors\(\)|origin:\s*true|Allow-Credentials.*true|AllowAnyOrigin"
```

## 27. Missing/weak security headers

```powershell
Get-ChildItem -Recurse | Select-String "helmet|Content-Security-Policy|Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|Referrer-Policy|Permissions-Policy"
```

## 28. Cookie / session security

```powershell
Get-ChildItem -Recurse | Select-String "httpOnly\s*[:=]\s*false|secure\s*[:=]\s*false|sameSite\s*[:=]\s*.?none|setCookie|Set-Cookie|session.*secret"
```

## 29. CSRF protection gaps

```powershell
Get-ChildItem -Recurse | Select-String "csrf|xsrf|csrf_exempt|CsrfViewMiddleware|X-CSRF-Token|ValidateAntiForgeryToken"
```

## 30. Open Redirect

```powershell
Get-ChildItem -Recurse | Select-String "window.location|location.href|redirect\(|sendRedirect|res.redirect|HttpResponseRedirect|navigate\(|history.push|router.push"
```

## 31. File Upload handling

```powershell
Get-ChildItem -Recurse | Select-String "multer|multipart|MultipartFile|move_uploaded_file|FormData|saveAs|writeFile|getOriginalFilename"
```

## 32. HTTP header / response splitting

```powershell
Get-ChildItem -Recurse | Select-String "setHeader\(.*\+|addHeader\(.*\+|header\(.*\`$_|Response.Headers.Add\(.*\+|res.set\(.*req\."
```

## 33. Log injection / sensitive data in logs

```powershell
Get-ChildItem -Recurse | Select-String "log.*(password|secret|token|apiKey|ssn|creditCard|authorization)|console.log.*(pass|token|secret)"
```

## 34. ReDoS (catastrophic regex)

```powershell
Get-ChildItem -Recurse | Select-String "\(\.\*\)\+|\(\.\+\)\+|RegExp\(.*req\.|new Regex\(.*input"
```

## 35. Race conditions / TOCTOU

```powershell
Get-ChildItem -Recurse | Select-String "File.Exists.*File.(Open|Write)|os.path.exists.*open\(|mktemp|tmpnam|tempnam"
```

## 36. Insecure temp files

```powershell
Get-ChildItem -Recurse | Select-String "/tmp/|tmpnam|tempnam|mktemp|File.createTempFile|tempfile.mktemp|GetTempFileName"
```

## 37. GraphQL issues

```powershell
Get-ChildItem -Recurse | Select-String "introspection\s*:\s*true|graphiql\s*:\s*true|depthLimit|costAnalysis|ApolloServer\("
```

## 38. Hardcoded URLs / IPs / internal hosts

```powershell
Get-ChildItem -Recurse | Select-String "http://|https://|localhost|127.0.0.1|0.0.0.0|\.internal|\.corp|\.local|jdbc:|mongodb://|redis://|amqp://"
```

## 39. IaC / Terraform misconfig

```powershell
Get-ChildItem -Recurse -Filter *.tf | Select-String 'cidr_blocks.*0\.0\.0\.0/0|publicly_accessible\s*=\s*true|acl\s*=\s*"public-read"|encrypted\s*=\s*false|ssl\s*=\s*false'
```

## 40. Dockerfile misconfig

```powershell
Get-ChildItem -Recurse -Filter Dockerfile* | Select-String "USER root|^USER 0|--privileged|ADD http|curl.*\| ?sh|chmod 777|FROM .*:latest|--allow-untrusted"
```

## 41. Kubernetes misconfig

```powershell
Get-ChildItem -Recurse -Include *.yaml,*.yml | Select-String "privileged:\s*true|runAsNonRoot:\s*false|allowPrivilegeEscalation:\s*true|hostNetwork:\s*true|hostPID:\s*true|SYS_ADMIN"
```

## 42. CI/CD secrets & pipeline risks

```powershell
Get-ChildItem -Recurse -Include *.yml,*.yaml | Select-String "pull_request_target|ACTIONS_ALLOW_UNSECURE|aws_access_key|password:\s*\S"
```

## 43. TODO / FIXME / backdoors

```powershell
Get-ChildItem -Recurse | Select-String "TODO|FIXME|HACK|XXX|INSECURE|backdoor|masterkey|test.?password|remove before|do not use in prod"
```

## 44. Potentially unauthenticated routes

```powershell
Get-ChildItem -Recurse | Select-String "router.get|router.post|app.get|app.post|@app.route|@GetMapping|@PostMapping|@RequestMapping" | Select-String -NotMatch "auth|isAuthenticated|requireLogin|login_required|verifyToken|middleware|PreAuthorize"
```

## 45. Codebase inventory / language mix

```powershell
Get-ChildItem -Recurse -File | Group-Object Extension | Sort-Object Count -Descending | Select-Object Count,Name
```

## 46. Faster all-in-one sweep

```powershell
Get-ChildItem -Recurse -Include *.js,*.ts,*.jsx,*.tsx,*.py,*.java,*.cs,*.php,*.go,*.rb | Select-String -Pattern "eval\(|innerHTML|exec\(|query\(|password|secret|apiKey|token|MD5|verify=false|InsecureSkipVerify|dangerouslySetInnerHTML|unserialize|pickle.load|__proto__|render_template_string" | Group-Object Filename | Sort-Object Count -Descending
```

## 47. SAST / secret scanner tools

```powershell
semgrep --config=auto .
semgrep --config=p/security-audit --config=p/secrets --config=p/owasp-top-ten .
gitleaks detect -v
trufflehog filesystem . --only-verified
trivy fs --scanners vuln,secret,misconfig .
osv-scanner -r .
```
