# SAST / Secure Code Review — Linux (Bash + grep)

> `grep` patterns for source-code review on Linux/macOS. Run from the project root (`.`).
> Uses GNU `grep -P` (PCRE) for `\d`, `\b`, `\K`, lookaheads. Every hit is a triage lead, not a confirmed vuln.
> To cut noise, add: `--exclude-dir={.git,node_modules,dist,build,vendor,target}` to any command.

---

## 1. Broad secret hunting

```bash
grep -rniP -e 'password\s*[=:]' -e 'passwd\s*[=:]' -e 'secret\s*[=:]' -e 'api[_-]?key\s*[=:]' -e 'access[_-]?key\s*[=:]' -e 'token\s*[=:]' -e 'client[_-]?secret\s*[=:]' -e 'credentials?\s*[=:]' -e 'auth\s*[=:]' .
```

## 2. Cloud & provider keys

```bash
grep -rnP -e 'AKIA[0-9A-Z]{16}' -e 'ASIA[0-9A-Z]{16}' -e 'AIza[0-9A-Za-z_\-]{35}' -e 'ya29\.[0-9A-Za-z_\-]+' -e 'ghp_[0-9A-Za-z]{36}' -e 'gho_[0-9A-Za-z]{36}' -e 'github_pat_[0-9A-Za-z_]{82}' -e 'glpat-[0-9A-Za-z_\-]{20}' -e 'xox[baprs]-[0-9A-Za-z-]{10,}' -e 'sk_live_[0-9A-Za-z]{24,}' -e 'rk_live_[0-9A-Za-z]{24,}' -e 'SG\.[0-9A-Za-z_\-]{22}\.[0-9A-Za-z_\-]{43}' -e 'AC[0-9a-f]{32}' -e 'sk-[A-Za-z0-9]{20,}' -e 'dckr_pat_[0-9A-Za-z_\-]{20,}' -e 'npm_[0-9A-Za-z]{36}' .
```

## 3. Private keys & certificates

```bash
grep -rnP 'BEGIN (RSA|EC|DSA|OPENSSH|PGP)? ?PRIVATE KEY|BEGIN CERTIFICATE' .; find . -type f \( -name '*.pem' -o -name '*.key' -o -name '*.pfx' -o -name '*.p12' -o -name '*.jks' -o -name '*.keystore' \)
```

## 4. Hardcoded crypto keys / IVs / salts

```bash
grep -rniP -e 'IV\s*=\s*["'\''`][0-9a-f]{16,}' -e 'key\s*=\s*["'\''`][0-9a-f]{16,}' -e 'salt\s*=\s*["'\''`]' -e 'SecretKeySpec\(' -e 'new byte\[\]\s*\{' -e 'Encoding\.\w+\.GetBytes\(".*key' .
```

## 5. JWTs / bearer tokens

```bash
grep -rnP -e 'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}' -e 'Bearer\s+[A-Za-z0-9._-]+' .
```

## 6. JWT weak validation

```bash
grep -rniP -e 'algorithms?\s*[:=]\s*\[?\s*["'\'']?none' -e 'verify\s*[:=]\s*false' -e 'jwt\.decode\((?!.*verify)' -e 'ignoreExpiration\s*:\s*true' -e 'noTimestamp|expiresIn\s*:\s*["'\'']?(0|never)' .
```

## 7. XSS (DOM / reflected)

```bash
grep -rnP --include='*.js' --include='*.ts' --include='*.jsx' --include='*.tsx' --include='*.vue' --include='*.html' -e 'dangerouslySetInnerHTML' -e 'innerHTML\s*=' -e 'outerHTML\s*=' -e 'document\.write' -e 'insertAdjacentHTML' -e 'v-html' -e 'bypassSecurityTrust' -e '\$\(.*\)\.html\(' .
```

## 8. Server-side template injection (SSTI)

```bash
grep -rnP -e 'render_template_string' -e 'Template\(.*\+' -e 'Jinja2|jinja' -e 'Velocity|Freemarker|Thymeleaf' -e 'new Template\(' -e '\{\{.*\+.*\}\}' .
```

## 9. SQL Injection

```bash
grep -rniP -e 'select .*(\+|\|\||\$\{|%s|format\().*from' -e 'execute\(.*(\+|%|format|concat)' -e 'query\s*=\s*["'\''`].*\+' -e 'rawQuery|knex\.raw|sequelize\.query|createStatement|Statement\.execute' -e '@Query\(.*\+' .
```

## 10. NoSQL Injection

```bash
grep -rnP -e '\$where\s*:' -e 'find\(\s*\{.*req\.' -e 'mapReduce|\$function' -e 'db\.\w+\.find\(.*\+' -e 'JSON\.parse\(req\.' .
```

## 11. LDAP / XPath injection

```bash
grep -rniP -e 'search\(.*\+.*\)' -e 'DirContext|InitialDirContext' -e 'ldap.*filter.*\+' -e 'XPathExpression|xpath\.compile\(.*\+' -e 'selectNodes\(.*\+' .
```

## 12. Command Injection

```bash
grep -rnP -e 'exec\(|execSync|spawn\(|spawnSync|child_process' -e 'Runtime\.getRuntime\(\)\.exec|ProcessBuilder' -e 'os\.system|os\.popen|subprocess\..*shell\s*=\s*True' -e 'shell_exec|passthru|proc_open|popen' -e 'exec\.Command' .
```

## 13. SSRF

```bash
grep -rniP -e 'axios\.(get|post)\(.*(\+|\$|req)' -e 'fetch\(.*(\+|\$|req)' -e 'requests\.(get|post)\(.*\+' -e 'urlopen\(.*\+' -e 'HttpClient|WebClient|RestTemplate' -e 'curl_setopt.*CURLOPT_URL' -e 'new URL\(.*(req|param|input)' .
```

## 14. Path Traversal / arbitrary file read

```bash
grep -rnP -e '\.\./|\.\.\\' -e 'readFile|readFileSync|createReadStream|sendFile|res\.download' -e 'file_get_contents\(\$|fopen\(\$' -e 'new File\(.*\+' -e 'Path\.Combine\(.*(request|param|input)' -e 'os\.path\.join\(.*request' .
```

## 15. Zip Slip / archive extraction

```bash
grep -rnP -e 'ZipFile|ZipInputStream|getNextEntry' -e 'extractall\(' -e 'unzip|tarfile\.open' -e 'entry\.getName\(\)' .
```

## 16. Insecure Deserialization

```bash
grep -rnP -e 'ObjectInputStream|readObject\(|XMLDecoder' -e 'BinaryFormatter|LosFormatter|JavaScriptSerializer|SoapFormatter' -e 'pickle\.loads?|cPickle|marshal\.loads' -e 'yaml\.load\((?!.*Loader)' -e 'unserialize\(' -e 'Marshal\.load' .
```

## 17. XXE / XML Parsers

```bash
grep -rnP -e 'DocumentBuilderFactory|SAXParserFactory|XMLReader|TransformerFactory' -e 'XmlDocument|XmlTextReader' -e 'etree\.parse|lxml|xml\.dom|expatreader|xmlrpc' -e 'DOCTYPE|ENTITY|SYSTEM ' .
```

## 18. Weak Cryptography

```bash
grep -rniP -e '\bMD5\b' -e '\bSHA-?1\b' -e '\bDES\b|3DES|TripleDES' -e 'RC4|RC2|Blowfish' -e 'ECB' -e 'Math\.random|mt_rand|rand\(\)|random\.random' -e 'createCipher\(' -e 'TLSv1(\.0|\.1)?|SSLv2|SSLv3' -e 'NullCipher' .
```

## 19. Insecure randomness (non-CSPRNG for tokens)

```bash
grep -rniP -e 'Math\.random\(\).*(token|password|otp|nonce|session)' -e 'new Random\(\)' -e 'random\.(randint|choice|random)\(' -e 'rand\(\)|srand\(' -e 'uuid1\(' .
```

## 20. Dangerous Functions / RCE

```bash
grep -rnP -e '\beval\(' -e 'new Function\(' -e 'assert\(' -e 'setTimeout\(\s*["'\''`]' -e 'vm\.runInContext|vm\.runInNewContext' -e '__import__\(|importlib' -e 'Assembly\.Load|Activator\.CreateInstance' -e 'Class\.forName|reflect\.Method|getMethod\(' .
```

## 21. Prototype Pollution (JS)

```bash
grep -rnP --include='*.js' --include='*.ts' -e '__proto__' -e 'constructor\s*\[' -e 'prototype\[' -e 'Object\.assign\(.*req\.' -e 'merge\(|deepMerge|extend\(' -e 'lodash\.merge|_\.merge' .
```

## 22. Mass Assignment / over-posting

```bash
grep -rniP -e 'Object\.assign\(.*req\.body' -e 'req\.body\)' -e 'new \w+\(req\.body' -e 'ModelState|Bind\(' -e 'params\.permit|attr_accessible|strong_parameters' -e '\.\.\.req\.body' .
```

## 23. IDOR / missing authorization indicators

```bash
grep -rniP -e 'findById\(req\.(params|query|body)' -e 'where.*id.*req\.' -e 'params\[.id.\]' -e 'get_object_or_404\(.*request' . | grep -viP 'authorize|can\(|ability|policy|owner|current_user'
```

## 24. Disabled TLS / cert validation

```bash
grep -rniP -e 'verify\s*=\s*false' -e 'InsecureSkipVerify' -e 'rejectUnauthorized:\s*false' -e 'CURLOPT_SSL_VERIFY(PEER|HOST).*(0|false)' -e 'NODE_TLS_REJECT_UNAUTHORIZED' -e 'trustAllCerts|X509TrustManager|ALLOW_ALL_HOSTNAME' -e 'ServerCertificateValidationCallback' -e 'ssl\._create_unverified_context' .
```

## 25. Debug / verbose mode in production

```bash
grep -rniP -e 'debug\s*=\s*true' -e 'DEBUG\s*[:=]\s*True' -e 'app\.debug|flask.*debug=True' -e 'displayErrorDetails|whoops' -e 'printStackTrace|ex\.getMessage\(\)' -e 'NODE_ENV.*development' .
```

## 26. CORS misconfiguration

```bash
grep -rniP -e 'Access-Control-Allow-Origin.*\*' -e 'cors\(\s*\)' -e 'origin:\s*true' -e 'Allow-Credentials.*true' -e 'AllowAnyOrigin\(\)' .
```

## 27. Missing/weak security headers

```bash
grep -rniP -e 'helmet' -e 'Content-Security-Policy' -e 'Strict-Transport-Security' -e 'X-Frame-Options' -e 'X-Content-Type-Options' -e 'Referrer-Policy' -e 'Permissions-Policy' .
```

## 28. Cookie / session security

```bash
grep -rniP -e 'httpOnly\s*[:=]\s*false' -e 'secure\s*[:=]\s*false' -e 'sameSite\s*[:=]\s*["'\'']?none' -e 'setCookie|Set-Cookie' -e 'session.*secret\s*[:=]' .
```

## 29. CSRF protection gaps

```bash
grep -rniP -e 'csrf|xsrf' -e 'csrf_exempt|@csrf_exempt|CsrfViewMiddleware' -e 'X-CSRF-Token' -e 'ValidateAntiForgeryToken' .
```

## 30. Open Redirect

```bash
grep -rniP -e 'window\.location|location\.href' -e 'redirect\(.*(req|param|input|query)' -e 'sendRedirect|res\.redirect' -e 'HttpResponseRedirect\(.*request' -e 'header\(.Location:.*\$' .
```

## 31. File Upload handling

```bash
grep -rniP -e 'multer|multipart|MultipartFile' -e 'move_uploaded_file' -e 'FormData|saveAs|writeFile' -e 'getOriginalFilename|filename\s*=' .
```

## 32. HTTP header / response splitting

```bash
grep -rniP -e 'setHeader\(.*\+|addHeader\(.*\+' -e 'header\(.*\$_' -e 'Response\.Headers\.Add\(.*\+' -e 'res\.set\(.*req\.' .
```

## 33. Log injection / sensitive data in logs

```bash
grep -rniP -e 'log.*(password|secret|token|apikey|ssn|creditcard|authorization)' -e 'console\.log\(.*(pass|token|secret)' -e 'logger\.\w+\(.*\+.*(req|input|user)' .
```

## 34. ReDoS (catastrophic regex)

```bash
grep -rnP -e '\(\.\*\)\+|\(\.\+\)\+|\(\[.*\]\+\)\+' -e 'RegExp\(.*req\.|new Regex\(.*input' -e '(\w+\+)+\$' .
```

## 35. Race conditions / TOCTOU

```bash
grep -rnP -e 'File\.exists.*File\.(open|write)' -e 'os\.path\.exists.*open\(' -e 'access\(.*\).*open\(' -e 'mktemp\b|tmpnam|tempnam' .
```

## 36. Insecure temp files

```bash
grep -rnP -e '/tmp/[a-zA-Z0-9_]+' -e 'tmpnam|tempnam|mktemp\b' -e 'File\.createTempFile' -e 'tempfile\.mktemp' .
```

## 37. GraphQL issues

```bash
grep -rniP -e 'introspection\s*:\s*true' -e 'graphiql\s*:\s*true' -e 'depthLimit|costAnalysis' -e 'ApolloServer\(' .
```

## 38. Hardcoded URLs / IPs / internal hosts

```bash
grep -rnP -e 'http://[^ "'\'']+' -e '\b(?:\d{1,3}\.){3}\d{1,3}\b' -e 'localhost|127\.0\.0\.1|0\.0\.0\.0' -e '\.internal|\.corp|\.local' -e 'jdbc:[a-z]+://|mongodb(\+srv)?://|redis://|amqp://' .
```

## 39. IaC / Terraform misconfig

```bash
grep -rnP --include='*.tf' -e 'cidr_blocks\s*=\s*\["0\.0\.0\.0/0"\]' -e '"\*"' -e 'publicly_accessible\s*=\s*true' -e 'acl\s*=\s*"public-read"' -e 'encrypted\s*=\s*false' -e 'ssl\s*=\s*false' .
```

## 40. Dockerfile misconfig

```bash
grep -rnP --include='Dockerfile*' -e 'USER root|^USER 0' -e '--privileged' -e 'ADD http' -e 'curl.*\| ?sh' -e 'chmod 777' -e 'FROM .*:latest' -e 'apk add.*--allow-untrusted' .
```

## 41. Kubernetes misconfig

```bash
grep -rnP --include='*.yaml' --include='*.yml' -e 'privileged:\s*true' -e 'runAsNonRoot:\s*false' -e 'allowPrivilegeEscalation:\s*true' -e 'hostNetwork:\s*true|hostPID:\s*true' -e 'capabilities:.*SYS_ADMIN' .
```

## 42. CI/CD secrets & pipeline risks

```bash
grep -rniP --include='*.yml' --include='*.yaml' -e 'pull_request_target' -e 'ACTIONS_ALLOW_UNSECURE' -e 'echo.*\$\{\{.*secret' -e 'aws_access_key|password:\s*\S' .
```

## 43. TODO / FIXME / backdoors

```bash
grep -rnP -e 'TODO' -e 'FIXME' -e 'HACK' -e 'XXX' -e 'INSECURE' -e 'backdoor' -e 'masterkey' -e 'test.?password' -e 'remove before' -e 'do not use in prod' .
```

## 44. Potentially unauthenticated routes

```bash
grep -rnP -e 'router\.(get|post)|app\.(get|post)|@app\.route|@GetMapping|@PostMapping|@RequestMapping' . | grep -viP 'auth|isAuthenticated|requireLogin|login_required|verifyToken|middleware|@PreAuthorize'
```

## 45. Codebase inventory / language mix

```bash
find . -type f | grep -oP '\.\K[a-z0-9]+$' | sort | uniq -c | sort -rn
```

## 46. Faster all-in-one sweep

```bash
grep -rnP --include='*.js' --include='*.ts' --include='*.jsx' --include='*.tsx' --include='*.py' --include='*.java' --include='*.cs' --include='*.php' --include='*.go' --include='*.rb' -e '\beval\(' -e 'innerHTML' -e 'exec\(' -e 'query\(' -e 'password' -e 'secret' -e 'apiKey' -e 'token' -e '\bMD5\b' -e 'verify=false' -e 'InsecureSkipVerify' -e 'unserialize' -e 'pickle\.load' -e '__proto__' -e 'render_template_string' . | sort | uniq -c | sort -rn
```

## 47. SAST / secret scanner tools

```bash
semgrep --config=auto .
semgrep --config=p/security-audit --config=p/secrets --config=p/owasp-top-ten .
gitleaks detect -v
trufflehog filesystem . --only-verified
trivy fs --scanners vuln,secret,misconfig .
osv-scanner -r .
bandit -r . -ll        # Python
```
