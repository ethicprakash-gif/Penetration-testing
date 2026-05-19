# Java Code Analysis Basics for Pentesters

## 1. User Input Sources (Taint Sources)

These are attacker-controlled inputs entering the application.
During code review, first identify where untrusted data comes from.

| Source                | Example                        | Risk                    |
| --------------------- | ------------------------------ | ----------------------- |
| HTTP Parameter        | `request.getParameter("id")`   | User-controlled input   |
| HTTP Header           | `request.getHeader("Auth")`    | Header manipulation     |
| Cookies               | `request.getCookies()`         | Session tampering       |
| Request Body          | `request.getInputStream()`     | JSON/XML injection      |
| File Upload           | `MultipartFile.getBytes()`     | Malicious files         |
| File Input            | `FileInputStream()`            | Local file abuse        |
| Socket Input          | `socket.getInputStream()`      | Network-based attacks   |
| Environment Variables | `System.getenv()`              | Secret leakage          |
| Database Data         | `resultSet.getString()`        | Stored XSS              |
| Deserialization       | `readObject()`                 | RCE risk                |
| JWT Claims            | `jwt.getClaims()`              | Auth bypass if unsigned |
| Android Intent        | `getIntent().getStringExtra()` | Mobile attack surface   |

---

## Example

```java
String user = request.getParameter("user");
```

User fully controls `user`.

---

# 2. Taint Flow Concept

The most important concept in secure code review:

```text
User Input (Source)
        ↓
Application Logic
        ↓
Dangerous Function (Sink)
        ↓
Vulnerability
```

Example:

```java
String cmd = request.getParameter("host");

Runtime.getRuntime().exec("ping " + cmd);
```

Flow:

```text
getParameter()
    ↓
String concatenation
    ↓
Runtime.exec()
    ↓
Command Injection
```

---

# 3. Dangerous Sinks

A **sink** is a dangerous function where attacker-controlled data becomes exploitable.

| Vulnerability      | Dangerous Sink         |
| ------------------ | ---------------------- |
| SQL Injection      | `executeQuery()`       |
| Command Injection  | `Runtime.exec()`       |
| XSS                | `print()`, `println()` |
| SSRF               | `new URL()`            |
| Path Traversal     | `new File()`           |
| LDAP Injection     | `search()`             |
| XPath Injection    | `evaluate()`           |
| Template Injection | `Template.process()`   |
| Open Redirect      | `sendRedirect()`       |
| Deserialization    | `readObject()`         |

---

# 4. SQL Injection (SQLi)

## Vulnerable

```java
String id = request.getParameter("id");

String q =
 "SELECT * FROM users WHERE id=" + id;

stmt.executeQuery(q);
```

---

## Why Vulnerable?

User input directly modifies SQL query structure.

Attack:

```sql
1 OR 1=1
```

Resulting query:

```sql
SELECT * FROM users WHERE id=1 OR 1=1
```

---

## Secure

```java
PreparedStatement ps =
 conn.prepareStatement(
 "SELECT * FROM users WHERE id=?"
);

ps.setInt(1, Integer.parseInt(id));
```

---

## What to Look For

Search keywords:

```text
executeQuery(
execute(
createStatement(
```

Check whether:

* String concatenation is used
* Prepared statements are missing
* Input validation is absent

---

# 5. Command Injection

## Vulnerable

```java
String ip = request.getParameter("ip");

Runtime.getRuntime().exec("ping " + ip);
```

---

## Attack

```text
127.0.0.1 && whoami
```

Linux execution:

```bash
ping 127.0.0.1 && whoami
```

---

## Risk

Possible impacts:

* Remote Code Execution (RCE)
* Server compromise
* Reverse shell
* Data theft

---

## Secure

```java
ProcessBuilder pb =
 new ProcessBuilder("ping", ip);
```

Also validate input using allowlists.

---

## Dangerous APIs

| API                   | Risk              |
| --------------------- | ----------------- |
| `Runtime.exec()`      | Command Injection |
| `ProcessBuilder()`    | Command Injection |
| `ScriptEngine.eval()` | Code Execution    |

---

# 6. Path Traversal

## Vulnerable

```java
String file =
 request.getParameter("file");

File f =
 new File("/app/data/" + file);
```

---

## Attack

```text
../../../etc/passwd
```

Result:

```text
/app/data/../../../etc/passwd
```

---

## Risk

* Read sensitive files
* Access configs
* Read credentials
* Sometimes RCE through writable paths

---

## Secure

Use canonical path validation.

```java
File base = new File("/app/data/");
File target = new File(base, file);

if (!target.getCanonicalPath()
      .startsWith(base.getCanonicalPath())) {
    throw new SecurityException();
}
```

---

# 7. SSRF (Server-Side Request Forgery)

## Vulnerable

```java
String url =
 request.getParameter("url");

URL u = new URL(url);
```

---

## Attack

Cloud metadata access:

```text
http://169.254.169.254/latest/meta-data/
```

Internal service access:

```text
http://localhost:8080/admin
```

---

## Possible Impacts

* Internal network scanning
* Access internal services
* Read cloud credentials
* Firewall bypass
* Access Redis/Jenkins/internal APIs
* Possible RCE through vulnerable internal services

---

## Secure

* Allowlist domains
* Block internal IP ranges
* Disable redirects
* Validate protocols (`http/https` only)

---

# 8. Cross-Site Scripting (XSS)

## Vulnerable

```java
out.println(
 request.getParameter("name")
);
```

---

## Attack

```html
<script>alert(1)</script>
```

---

## Risk

* Session hijacking
* Cookie theft
* Account takeover
* Phishing
* DOM manipulation

---

## Secure

Use output encoding.

```java
String safe =
 StringEscapeUtils.escapeHtml4(name);
```

---

## Types of XSS

| Type          | Description           |
| ------------- | --------------------- |
| Reflected XSS | Immediate response    |
| Stored XSS    | Stored in DB          |
| DOM XSS       | Happens in browser JS |

---

# 9. Insecure Deserialization

## Vulnerable

```java
ObjectInputStream in =
 new ObjectInputStream(fileIn);

Object obj = in.readObject();
```

---

## Why Dangerous?

Deserialization reconstructs Java objects from attacker-controlled data.

Attackers may abuse gadget chains for RCE.

---

## Risk

* Remote Code Execution
* Authentication bypass
* Denial of Service

---

## Dangerous Classes

| API            | Risk            |
| -------------- | --------------- |
| `readObject()` | Deserialization |
| `XMLDecoder()` | RCE             |
| `Yaml.load()`  | Unsafe parsing  |

---

# 10. Authentication & Authorization Issues

## Dangerous Pattern

```java
if(role.equals("admin"))
```

---

## Questions to Ask

* Can attacker modify `role`?
* Is role coming from JWT/header/request?
* Is JWT signature verified?
* Is access control enforced server-side?

---

## Common Issues

| Issue                 | Example                       |
| --------------------- | ----------------------------- |
| Missing Authorization | No role check                 |
| IDOR                  | Accessing another user's data |
| Trusting Client       | Role from request             |
| JWT None Algorithm    | Signature bypass              |

---

# 11. Hardcoded Secrets

## Vulnerable

```java
String password = "admin123";
```

---

## Look For

* API keys
* JWT secrets
* AWS credentials
* DB passwords
* Encryption keys

---

## Search Keywords

```text
password=
secret=
apikey=
token=
AWS_SECRET
```

---

# 12. Open Redirect

## Vulnerable

```java
response.sendRedirect(url);
```

---

## Attack

```text
https://evil.com
```

---

## Risk

* Phishing
* OAuth token theft
* User redirection attacks

---

## Secure

Allowlist valid domains only.

---

# 13. Weak Cryptography

## Vulnerable

```java
Cipher.getInstance("AES/ECB/PKCS5Padding");
```

---

## Why Dangerous?

ECB mode leaks data patterns.

---

## Weak Algorithms

| Weak Crypto | Risk               |
| ----------- | ------------------ |
| MD5         | Broken hashing     |
| SHA1        | Collision attacks  |
| AES/ECB     | Pattern leakage    |
| DES         | Weak encryption    |
| Random()    | Predictable tokens |

---

## Secure Alternatives

| Weak     | Secure         |
| -------- | -------------- |
| MD5      | BCrypt/Argon2  |
| SHA1     | SHA256+        |
| Random() | SecureRandom() |
| ECB      | GCM/CBC        |

---

# 14. XXE (XML External Entity)

## Vulnerable

```java
DocumentBuilderFactory dbf =
 DocumentBuilderFactory.newInstance();
```

If external entities enabled:

```xml
<!DOCTYPE foo [
<!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
```

---

## Risk

* File read
* SSRF
* Internal network access

---

## Secure

Disable external entities.

---

# 15. Common Validation Mistakes

## Weak Validation

```java
if(input.contains("<script>"))
```

Easy bypass:

```html
<ScRiPt>
```

---

## Better Approach

* Allowlist validation
* Output encoding
* Parameterized queries

---

# 16. Important Java Security APIs

| API                              | Risk                  |
| -------------------------------- | --------------------- |
| `Runtime.exec()`                 | Command Injection     |
| `ProcessBuilder()`               | Command Injection     |
| `Statement.executeQuery()`       | SQLi                  |
| `ObjectInputStream.readObject()` | Deserialization       |
| `response.sendRedirect()`        | Open Redirect         |
| `new File()`                     | Path Traversal        |
| `new URL()`                      | SSRF                  |
| `Cipher.getInstance()`           | Weak Crypto           |
| `WebView.loadUrl()`              | Android WebView abuse |
| `ScriptEngine.eval()`            | Code Execution        |

---

# 17. Pentester Mindset

Always trace:

```text
User Input
   ↓
Validation?
   ↓
Authentication?
   ↓
Authorization?
   ↓
Dangerous Function?
   ↓
Exploitable?
```

---

# 18. Secure Code Review Flow

| Step | Action                             |
| ---- | ---------------------------------- |
| 1    | Identify user input                |
| 2    | Trace data flow                    |
| 3    | Find dangerous sinks               |
| 4    | Check validation                   |
| 5    | Check authentication/authorization |
| 6    | Determine exploitability           |
| 7    | Assess impact                      |

---

# 19. Useful Keywords to Search

## Input Sources

```text
getParameter(
getHeader(
getCookies(
readLine(
getInputStream(
```

---

## Dangerous Sinks

```text
executeQuery(
execute(
Runtime.getRuntime().exec(
ProcessBuilder(
readObject(
sendRedirect(
new File(
new URL(
eval(
```

---

## Authentication

```text
isAdmin
role=
jwt
Authorization
Bearer
```

---

# 20. Fast Manual Review Strategy

## First Pass

Find:

* Inputs
* Authentication
* File handling
* External requests

---

## Second Pass

Trace:

* Input → Sink
* User → Database
* User → File System
* User → Command Execution

---

## Third Pass

Check:

* Validation
* Authorization
* Encryption
* Business logic flaws

---

# 21. Real Pentester Thinking

Instead of only asking:

> “Is this code vulnerable?”

Ask:

* Can attacker control this value?
* Can attacker reach this function?
* Can validation be bypassed?
* Does authentication exist?
* Is authorization enforced?
* What is worst-case impact?
* Can vulnerabilities be chained?

Example chain:

```text
SSRF
  ↓
Access internal Jenkins
  ↓
Default credentials
  ↓
Script Console
  ↓
RCE
```

---

