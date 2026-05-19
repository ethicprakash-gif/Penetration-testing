# Python Secure Code Review Notes for Pentesters

> Practical Python secure code review and vulnerability hunting notes for pentesters, AppSec engineers, and security researchers.

---

# Table of Contents

1. User Input Sources (Taint Sources)
2. Taint Flow Concept
3. Dangerous Sinks
4. SQL Injection (SQLi)
5. Command Injection
6. Path Traversal
7. SSRF (Server-Side Request Forgery)
8. Cross-Site Scripting (XSS)
9. SSTI (Server-Side Template Injection)
10. Insecure Deserialization
11. Authentication & Authorization
12. File Upload Vulnerabilities
13. Open Redirect
14. Weak Cryptography
15. XXE (XML External Entity)
16. Dangerous Python APIs
17. Flask / Django Specific Checks
18. API Security Checks
19. Business Logic Checks
20. Race Condition Checks
21. Logging & Information Disclosure
22. Useful Search Keywords
23. Pentester Mindset
24. Real Attack Chain Example
25. Quick Manual Review Flow


---

# 1. User Input Sources (Taint Sources)

These are attacker-controlled inputs entering the application.

## Common Sources

| Source                | Example                 | Risk                  |
| --------------------- | ----------------------- | --------------------- |
| HTTP Parameters       | `request.args.get()`    | User input            |
| POST Data             | `request.form.get()`    | Injection             |
| JSON Body             | `request.json`          | API abuse             |
| Headers               | `request.headers.get()` | Header manipulation   |
| Cookies               | `request.cookies.get()` | Session tampering     |
| File Uploads          | `request.files`         | Malicious file upload |
| URL Path              | `/user/<id>`            | IDOR                  |
| Environment Variables | `os.getenv()`           | Secret leakage        |
| Command Line Args     | `sys.argv`              | CLI injection         |
| YAML/XML Input        | `yaml.load()`           | RCE                   |
| Pickle Data           | `pickle.loads()`        | Deserialization RCE   |

### Example

```python
user = request.args.get("user")
```

User controls `user`.

---

# 2. Taint Flow Concept

```text
User Input
    ↓
Application Logic
    ↓
Dangerous Sink
    ↓
Vulnerability
```

### Example

```python
cmd = request.args.get("host")

os.system("ping " + cmd)
```

Flow:

```text
request.args.get()
       ↓
String concatenation
       ↓
os.system()
       ↓
Command Injection
```

---

# 3. Dangerous Sinks

| Vulnerability     | Dangerous Sink             |
| ----------------- | -------------------------- |
| SQL Injection     | `cursor.execute()`         |
| Command Injection | `os.system()`              |
| RCE               | `eval()`                   |
| XSS               | `render_template()`        |
| SSRF              | `requests.get()`           |
| Path Traversal    | `open()`                   |
| Deserialization   | `pickle.loads()`           |
| SSTI              | `render_template_string()` |

---

# 4. SQL Injection (SQLi)

### Vulnerable Code

```python
user_id = request.args.get("id")

query = "SELECT * FROM users WHERE id=" + user_id

cursor.execute(query)
```

### Attack Payload

```sql
1 OR 1=1
```

## Why Vulnerable?

User input modifies SQL query structure.

### Secure Code

```python
cursor.execute(
    "SELECT * FROM users WHERE id=%s",
    (user_id,)
)
```

### Things to Check

* String concatenation
* f-strings in SQL queries
* `%` formatting
* `.format()` usage
* Raw SQL execution
* ORM raw queries

## Dangerous Patterns

```python
f"SELECT * FROM users WHERE id={id}"

"SELECT * FROM users" + user_input
```

### Search Keywords

```text
execute(
raw(
text(
```

---

# 5. Command Injection

### Vulnerable Code

```python
ip = request.args.get("ip")

os.system("ping " + ip)
```

### Attack Payload

```text
127.0.0.1 && whoami
```

### Dangerous APIs

| API                  | Risk              |
| -------------------- | ----------------- |
| `os.system()`        | Command Injection |
| `subprocess.Popen()` | RCE               |
| `subprocess.call()`  | RCE               |
| `os.popen()`         | RCE               |

## Dangerous Example

```python
subprocess.Popen(
    "ping " + ip,
    shell=True
)
```

`shell=True` is highly dangerous.

### Secure Code

```python
subprocess.run(
    ["ping", ip],
    shell=False
)
```

### Things to Check

* `shell=True`
* String concatenation
* User-controlled arguments
* Bash/sh execution
* Environment variable injection

---

# 6. Path Traversal

### Vulnerable Code

```python
filename = request.args.get("file")

with open("/app/files/" + filename) as f:
    data = f.read()
```

### Attack Payload

```text
../../../etc/passwd
```

### Risks

* Sensitive file read
* Config disclosure
* Credential leakage

### Secure Code

```python
from pathlib import Path

base = Path("/app/files").resolve()

target = (base / filename).resolve()

if not str(target).startswith(str(base)):
    raise Exception("Traversal detected")
```

### Things to Check

* `../`
* URL encoding bypass
* Absolute path injection
* Zip Slip
* User upload paths

---

# 7. SSRF (Server-Side Request Forgery)

### Vulnerable Code

```python
url = request.args.get("url")

requests.get(url)
```

### Attack Payload

```text
http://169.254.169.254/latest/meta-data/
```

### Risks

* Internal service access
* Cloud credential theft
* Port scanning
* Firewall bypass

## Dangerous Libraries

| Library    | Risk |
| ---------- | ---- |
| `requests` | SSRF |
| `urllib`   | SSRF |
| `httpx`    | SSRF |

### Things to Check

* Internal IP access
* Redirect following
* Non-HTTP protocols
* DNS rebinding
* User-controlled URLs

---

# 8. Cross-Site Scripting (XSS)

### Vulnerable Code

```python
return "<h1>" + name + "</h1>"
```

### Attack Payload

```html
<script>alert(1)</script>
```

### Risks

* Session hijacking
* Cookie theft
* Phishing
* DOM manipulation

## Dangerous Patterns

```python
Markup(user_input)

render_template_string(user_input)
```

### Things to Check

* Jinja2 rendering
* Disabled autoescape
* HTML reflection
* DOM XSS
* Unsafe markdown rendering

---

# 9. SSTI (Server-Side Template Injection)

### Vulnerable Code

```python
render_template_string(user_input)
```

### Attack Payload

```jinja2
{{7*7}}
```

## Advanced Payload

```jinja2
{{config.__class__.__init__.__globals__['os'].popen('id').read()}}
```

### Risks

* Remote Code Execution
* Secret access
* File read

### Things to Check

* Dynamic template rendering
* Jinja2 expression injection
* User-controlled templates

---

# 10. Insecure Deserialization

### Vulnerable Code

```python
pickle.loads(user_data)
```

## Why Dangerous?

Pickle can execute arbitrary Python code during deserialization.

### Risks

* Remote Code Execution
* Full server compromise

### Dangerous APIs

| API               | Risk                   |
| ----------------- | ---------------------- |
| `pickle.loads()`  | RCE                    |
| `yaml.load()`     | RCE                    |
| `marshal.loads()` | Unsafe deserialization |

### Secure Code

```python
yaml.safe_load(data)
```

### Things to Check

* Base64 pickle blobs
* Untrusted YAML
* Cache/session deserialization
* User-controlled serialized objects

---

# 11. Authentication & Authorization

## Dangerous Pattern

```python
if request.args.get("admin") == "true":
```

### Things to Check

* JWT signature validation
* Role modification
* Missing authorization
* IDOR
* Session fixation
* Weak password reset logic

## Common Issues

| Issue              | Example           |
| ------------------ | ----------------- |
| IDOR               | `/api/user/123`   |
| Missing Auth       | No token check    |
| Trusting Client    | Role from request |
| JWT None Algorithm | Signature bypass  |

---

# 12. File Upload Vulnerabilities

### Vulnerable Code

```python
file.save("/uploads/" + file.filename)
```

### Risks

* Web shell upload
* Path traversal
* Malware upload

## Bypass Examples

```text
shell.php.jpg
test.jsp;.png
```

### Things to Check

* Extension validation
* MIME type trust
* Public upload directory
* Executable file upload
* Filename sanitization

---

# 13. Open Redirect

### Vulnerable Code

```python
return redirect(url)
```

### Attack Payload

```text
https://evil.com
```

### Risks

* Phishing
* OAuth token theft

### Things to Check

* External redirects
* Missing allowlist
* Header injection

---

# 14. Weak Cryptography

## Dangerous Patterns

```python
hashlib.md5(data)

random.random()
```

### Risks

* Predictable tokens
* Weak hashing
* Session compromise

## Secure Alternatives

| Weak   | Secure  |
| ------ | ------- |
| MD5    | bcrypt  |
| SHA1   | SHA256  |
| random | secrets |

### Things to Check

* Hardcoded keys
* Static IVs
* ECB mode
* Weak token generation

---

# 15. XXE (XML External Entity)

### Vulnerable Code

```python
from lxml import etree

etree.parse(xml_data)
```

### Risks

* File read
* SSRF
* Internal access

### Things to Check

* XML parsers
* SVG uploads
* SOAP services
* External entities enabled

---

# 16. Dangerous Python APIs

| API                        | Risk              |
| -------------------------- | ----------------- |
| `eval()`                   | Code Execution    |
| `exec()`                   | RCE               |
| `os.system()`              | Command Injection |
| `subprocess.Popen()`       | RCE               |
| `pickle.loads()`           | Deserialization   |
| `yaml.load()`              | RCE               |
| `requests.get()`           | SSRF              |
| `open()`                   | Path Traversal    |
| `render_template_string()` | SSTI              |
| `redirect()`               | Open Redirect     |

---

# 17. Flask / Django Specific Checks

## Flask

### Check For

* `debug=True`
* Secret key exposure
* SSTI in Jinja2
* Unsafe session handling

## Django

### Check For

* `DEBUG=True`
* CSRF disabled
* Unsafe serializers
* Raw SQL usage

---

# 18. API Security Checks

## Check For

* Missing authentication
* Broken authorization
* Rate limiting absence
* Mass assignment
* Excessive data exposure
* JWT flaws
* GraphQL introspection

---

# 19. Business Logic Checks

## Check For

* Coupon abuse
* Race conditions
* Payment bypass
* Negative quantity/value
* OTP reuse
* Workflow bypass

---

# 20. Race Condition Checks

### Example

```text
Check balance
    ↓
Deduct money
```

Can requests execute simultaneously?

### Things to Check

* Parallel requests
* Shared resources
* Double spending
* Inventory abuse

---

# 21. Logging & Information Disclosure

## Check For

* Stack traces
* Debug endpoints
* Secret leakage
* Verbose errors
* Internal IP exposure

---

# 22. Useful Search Keywords

## Inputs

```text
request.args
request.form
request.json
request.headers
```

## Dangerous Sinks

```text
eval(
exec(
os.system(
subprocess.Popen(
pickle.loads(
yaml.load(
render_template_string(
```

---

# 23. Pentester Mindset

Always ask:

```text
Can attacker control this?
Can validation be bypassed?
Can this become RCE?
Can vulnerabilities chain together?
What is worst-case impact?
```

---

# 24. Real Attack Chain Example

```text
SSRF
   ↓
Internal Redis Access
   ↓
Write SSH Key
   ↓
Remote Shell
```

---

# 25. Quick Manual Review Flow

| Step | Action                             |
| ---- | ---------------------------------- |
| 1    | Identify user input                |
| 2    | Trace data flow                    |
| 3    | Find dangerous sinks               |
| 4    | Check validation                   |
| 5    | Check authentication/authorization |
| 6    | Assess exploitability              |
| 7    | Determine impact                   |

